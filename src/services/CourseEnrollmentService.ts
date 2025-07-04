import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface EnrollmentResult {
  success: boolean;
  enrollment?: any;
  error?: string;
  requiresPayment?: boolean;
  courseId?: string;
}

export const CourseEnrollmentService = {
  async enrollInCourse(courseId: string, userId: string): Promise<EnrollmentResult> {
    try {
      console.log("Starting enrollment process for course:", courseId, "user:", userId);
      
      // Verify user is authenticated and get fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        return {
          success: false,
          error: "Please log in to complete your enrollment"
        };
      }

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser || currentUser.id !== userId) {
        console.error("User authentication error:", userError);
        return {
          success: false,
          error: "Authentication error. Please log in again."
        };
      }

      console.log("User authenticated successfully:", currentUser.id);

      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      if (enrollmentCheckError) {
        console.error("Error checking existing enrollment:", enrollmentCheckError);
        return {
          success: false,
          error: "Database error. Please try again."
        };
      }

      if (existingEnrollment) {
        console.log("User already enrolled in course");
        return {
          success: true,
          enrollment: existingEnrollment,
          error: "Already enrolled"
        };
      }

      // Check if course is free first
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("price, discounted_price")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("Error fetching course data:", courseError);
        return {
          success: false,
          error: "Course not found."
        };
      }

      // Determine effective price (use discounted_price if available and valid)
      const effectivePrice = (courseData.discounted_price !== undefined && 
                            courseData.discounted_price !== null && 
                            courseData.discounted_price > 0) 
                           ? courseData.discounted_price 
                           : courseData.price;

      const isFree = !effectivePrice || effectivePrice === 0;
      console.log("Course pricing - Original:", courseData.price, "Discounted:", courseData.discounted_price, "Effective:", effectivePrice, "Is free:", isFree);

      // If course is not free, check for payment
      if (!isFree) {
        const { data: paymentRecord, error: paymentError } = await supabase
          .from("payment_transactions")
          .select("id, status")
          .eq("course_id", courseId)
          .eq("user_id", userId)
          .eq("status", "successful")
          .maybeSingle();

        if (paymentError) {
          console.error("Error checking payment:", paymentError);
          return {
            success: false,
            error: "Payment verification error. Please try again."
          };
        }

        console.log("Payment record found:", paymentRecord);

        if (!paymentRecord) {
          console.log("Payment required for course");
          return {
            success: false,
            error: "Payment required",
            requiresPayment: true,
            courseId: courseId
          };
        }
      }

      // Create new enrollment record
      console.log("Creating enrollment record for user:", userId, "course:", courseId);
      const { data: enrollment, error: insertError } = await supabase
        .from("enrollments")
        .insert({
          course_id: courseId,
          student_id: userId,
          progress: 0,
          enrollment_date: new Date().toISOString(),
          completed: false
        })
        .select()
        .single();

      if (insertError) {
        console.error("Enrollment insert error:", insertError);
        toast({
          title: "Enrollment Failed",
          description: "There was a problem enrolling in this course. Please try again.",
          variant: "destructive",
        });
        return {
          success: false,
          error: insertError.message
        };
      }

      console.log("Enrollment successful:", enrollment);
      toast({
        title: "Successfully Enrolled",
        description: "You have been enrolled in the course.",
      });

      return {
        success: true,
        enrollment
      };
    } catch (error: any) {
      console.error("Enrollment exception:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred"
      };
    }
  },

  async trackLessonProgress(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    try {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .single();

      if (!enrollment) {
        console.error("No enrollment found");
        return false;
      }

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId);

      if (!totalLessons) return false;

      const { data, error } = await supabase
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

      await supabase
        .from("enrollments")
        .update({ progress: newProgress })
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

      if (error) throw error;

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
      const { data, error } = await supabase
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
