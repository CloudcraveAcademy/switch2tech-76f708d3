
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      
      // Simple auth check without complex validation
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
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .single();

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
      const { data: courseData } = await supabase
        .from("courses")
        .select("price")
        .eq("id", courseId)
        .single();

      const isFree = !courseData?.price || courseData.price === 0;
      console.log("CourseEnrollmentService: Course is free:", isFree);

      // If course is not free, check for payment
      if (!isFree) {
        const { data: paymentRecord } = await supabase
          .from("payment_transactions")
          .select("id, status")
          .eq("course_id", courseId)
          .eq("user_id", userId)
          .eq("status", "successful")
          .maybeSingle();

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
