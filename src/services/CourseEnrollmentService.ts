
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NotificationService } from "./NotificationService";

export interface EnrollmentResult {
  success: boolean;
  enrollment?: any;
  error?: string;
  requiresPayment?: boolean;
  requiresAuth?: boolean;
  courseId?: string;
}

export const CourseEnrollmentService = {
  async enrollInCourse(courseId: string, userId?: string): Promise<EnrollmentResult> {
    try {
      console.log("CourseEnrollmentService: Starting enrollment", { courseId, userId });
      
      if (!userId) {
        console.log("CourseEnrollmentService: No user ID provided");
        return {
          success: false,
          error: "Authentication required",
          requiresAuth: true,
          courseId: courseId
        };
      }

      // Check if already enrolled
      console.log("CourseEnrollmentService: Checking existing enrollment");
      const { data: existingEnrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      if (enrollmentError) {
        console.error("CourseEnrollmentService: Error checking enrollment:", enrollmentError);
        return {
          success: false,
          error: enrollmentError.message
        };
      }

      if (existingEnrollment) {
        console.log("CourseEnrollmentService: User already enrolled");
        return {
          success: true,
          enrollment: existingEnrollment,
          error: "Already enrolled"
        };
      }

      // Check if course is free
      console.log("CourseEnrollmentService: Checking course pricing");
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("price, discounted_price")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) {
        console.error("CourseEnrollmentService: Error fetching course:", courseError);
        return {
          success: false,
          error: courseError.message
        };
      }

      const effectivePrice = courseData?.discounted_price || courseData?.price || 0;
      const isFree = effectivePrice === 0;
      console.log("CourseEnrollmentService: Course is free:", isFree, "Price:", effectivePrice);

      // If course is not free, check for payment
      if (!isFree) {
        const { data: paymentRecord, error: paymentError } = await supabase
          .from("payment_transactions")
          .select("id, status")
          .eq("course_id", courseId)
          .eq("user_id", userId)
          .in("status", ["successful", "completed", "success"])
          .maybeSingle();

        if (paymentError) {
          console.error("CourseEnrollmentService: Error checking payment:", paymentError);
        }

        if (!paymentRecord) {
          console.log("CourseEnrollmentService: Payment required");
          return {
            success: false,
            error: "Payment required",
            requiresPayment: true,
            courseId: courseId
          };
        }
      }

      // Create new enrollment record
      console.log("CourseEnrollmentService: Creating enrollment record");
      const { data: enrollment, error } = await supabase
        .from("enrollments")
        .insert({
          course_id: courseId,
          student_id: userId,
          progress: 0,
          enrollment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("CourseEnrollmentService: Enrollment error:", error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log("CourseEnrollmentService: Enrollment successful", enrollment);

      // Get course details for notification
      const { data: course } = await supabase
        .from("courses")
        .select("title, instructor_id, instructor:user_profiles!instructor_id(first_name, last_name)")
        .eq("id", courseId)
        .single();

      if (course) {
        // Notify student of successful enrollment
        try {
          await NotificationService.notifyStudentEnrollment(userId, course.title, courseId);
        } catch (notificationError) {
          console.error("Failed to send student enrollment notification:", notificationError);
        }

        // Notify instructor of new enrollment
        if (course.instructor_id) {
          try {
            const studentName = `Student`; // We could fetch the actual student name here
            await NotificationService.notifyInstructorEnrollment(
              course.instructor_id, 
              studentName, 
              course.title, 
              courseId
            );
          } catch (notificationError) {
            console.error("Failed to send instructor enrollment notification:", notificationError);
          }
        }
      }
      
      toast({
        title: "Successfully Enrolled",
        description: "You have been enrolled in the course.",
      });

      return {
        success: true,
        enrollment
      };
    } catch (error: any) {
      console.error("CourseEnrollmentService: Exception:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async createPaymentTransaction(
    userId: string, 
    courseId: string, 
    amount: number, 
    currency: string = 'NGN',
    paymentReference?: string,
    paymentMethod: string = 'card'
  ): Promise<boolean> {
    try {
      console.log("CourseEnrollmentService: Creating payment transaction", {
        userId, courseId, amount, currency, paymentReference, paymentMethod
      });

      const { error } = await supabase
        .from("payment_transactions")
        .insert({
          user_id: userId,
          course_id: courseId,
          amount: amount,
          currency: currency,
          status: "successful",
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          paystack_reference: paymentReference,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("CourseEnrollmentService: Error creating payment transaction:", error);
        return false;
      }

      console.log("CourseEnrollmentService: Payment transaction created successfully");
      return true;
    } catch (error) {
      console.error("CourseEnrollmentService: Exception creating payment transaction:", error);
      return false;
    }
  },

  async trackLessonProgress(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    try {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      if (enrollmentError || !enrollment) {
        console.error("No enrollment found or error:", enrollmentError);
        return false;
      }

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId);

      if (!totalLessons) return false;

      const { error } = await supabase
        .from("student_lesson_progress")
        .upsert(
          {
            student_id: userId,
            lesson_id: lessonId,
            course_id: courseId,
            completed: true,
            last_accessed: new Date().toISOString()
          },
          { onConflict: "student_id,lesson_id", ignoreDuplicates: false }
        );

      if (error) {
        console.error("Error tracking lesson progress:", error);
        return false;
      }

      const { count: completedLessons } = await supabase
        .from("student_lesson_progress")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .eq("completed", true);

      if (completedLessons === undefined) return false;

      const newProgress = Math.round((completedLessons / totalLessons) * 100);

      // Update progress and mark as completed if 100%
      const updateData: { progress: number; completed?: boolean; completion_date?: string } = {
        progress: newProgress
      };

      if (newProgress >= 100) {
        updateData.completed = true;
        updateData.completion_date = new Date().toISOString();
      }

      await supabase
        .from("enrollments")
        .update(updateData)
        .eq("id", enrollment.id);

      return true;
    } catch (error) {
      console.error("Error in trackLessonProgress:", error);
      return false;
    }
  },

  async getStudentCourseLessonProgress(userId: string, courseId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from("student_lesson_progress")
        .select("lesson_id, completed")
        .eq("course_id", courseId)
        .eq("student_id", userId);

      if (error) {
        console.error("Error fetching lesson progress:", error);
        return {};
      }

      const progressMap: Record<string, boolean> = {};
      
      data?.forEach(item => {
        progressMap[item.lesson_id] = item.completed;
      });
      
      return progressMap;
    } catch (error) {
      console.error("Error fetching lesson progress:", error);
      return {};
    }
  },

  async recordClassAttendance(userId: string, courseId: string, classSessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("class_attendance")
        .insert({
          student_id: userId,
          course_id: courseId,
          class_session_id: classSessionId,
          attended_at: new Date().toISOString(),
          attendance_status: "present"
        });

      if (error) {
        console.error("Error recording attendance:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception recording attendance:", error);
      return false;
    }
  }
};
