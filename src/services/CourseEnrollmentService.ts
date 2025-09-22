
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

      // If course is not free, redirect to enrollment page for payment
      if (!isFree) {
        console.log("CourseEnrollmentService: Payment required, redirecting to enrollment page");
        return {
          success: false,
          error: "Payment required",
          requiresPayment: true,
          courseId: courseId
        };
      }

      // Create new enrollment record (only for free courses)
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

      // No payment transaction needed for free courses

      // Get course details for notification
      const { data: course } = await supabase
        .from("courses")
        .select("title, instructor_id, instructor:user_profiles_public!instructor_id(first_name, last_name)")
        .eq("id", courseId)
        .single();

      if (course) {
        console.log("Found course for notifications:", course);
        
        // Notify student of successful enrollment
        try {
          console.log("Sending student enrollment notification...");
          await NotificationService.notifyStudentEnrollment(userId, course.title, courseId);
          console.log("Student notification sent successfully");
        } catch (notificationError) {
          console.error("Failed to send student enrollment notification:", notificationError);
        }

        // Notify instructor of new enrollment
        if (course.instructor_id) {
          try {
            console.log("Sending instructor enrollment notification...");
            const studentName = `Student`; // We could fetch the actual student name here
            await NotificationService.notifyInstructorEnrollment(
              course.instructor_id, 
              studentName, 
              course.title, 
              courseId
            );
            console.log("Instructor notification sent successfully");
          } catch (notificationError) {
            console.error("Failed to send instructor enrollment notification:", notificationError);
          }
        } else {
          console.log("No instructor_id found for course");
        }
      } else {
        console.log("No course data found for notifications");
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
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency,
          status: "completed",
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
      console.log("CourseEnrollmentService: trackLessonProgress called", { userId, courseId, lessonId });
      
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      let enrollmentId = enrollment?.id;

      if (enrollmentError) {
        console.error("Error checking enrollment:", enrollmentError);
      }

      if (!enrollmentId) {
        // Attempt automatic enrollment for free courses
        const { data: coursePricing, error: coursePricingError } = await supabase
          .from("courses")
          .select("price, discounted_price")
          .eq("id", courseId)
          .maybeSingle();

        if (coursePricingError) {
          console.error("Error fetching course pricing:", coursePricingError);
          return false;
        }

        const effectivePrice = coursePricing?.discounted_price || coursePricing?.price || 0;
        const isFree = effectivePrice === 0;

        if (isFree) {
          const { data: newEnrollment, error: createEnrollError } = await supabase
            .from("enrollments")
            .insert({
              course_id: courseId,
              student_id: userId,
              progress: 0,
              enrollment_date: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createEnrollError || !newEnrollment) {
            console.error("Failed to auto-enroll in free course:", createEnrollError);
            return false;
          }

          console.log("Auto-enrolled user in free course");
          enrollmentId = newEnrollment.id;
        } else {
          console.error("No enrollment found and course requires payment");
          toast?.({
            title: "Enrollment required",
            description: "Please enroll to save your progress.",
            variant: "destructive",
          });
          return false;
        }
      }

      console.log("Found enrollment:", enrollment);

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId);

      console.log("Total lessons:", totalLessons);
      if (!totalLessons) return false;

      console.log("Upserting lesson progress for lesson:", lessonId);
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

      console.log("Lesson progress upserted successfully");

      const { count: completedLessons } = await supabase
        .from("student_lesson_progress")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .eq("completed", true);

      if (completedLessons === undefined) return false;

      console.log("Completed lessons:", completedLessons);
      const newProgress = Math.round((completedLessons / totalLessons) * 100);
      console.log("New progress:", newProgress);

      // Check if this should trigger course completion
      const shouldComplete = await this.checkCourseCompletion(userId, courseId, newProgress);
      console.log("Should complete course:", shouldComplete);

      // Update progress and mark as completed if requirements are met
      const updateData: { progress: number; completed?: boolean; completion_date?: string } = {
        progress: newProgress
      };

      if (shouldComplete) {
        updateData.completed = true;
        updateData.completion_date = new Date().toISOString();
        console.log("Marking course as completed");
      }

      console.log("Updating enrollment with data:", updateData);
      const { error: updateError } = await supabase
        .from("enrollments")
        .update(updateData)
        .eq("id", enrollmentId);

      if (updateError) {
        console.error("Error updating enrollment:", updateError);
        return false;
      }

      console.log("Enrollment updated successfully.");
      
      // For completed courses, the database trigger will handle certificate issuance automatically
      if (shouldComplete) {
        console.log("Course marked as completed - certificate trigger will handle issuance");
        
        // Optional: Show immediate feedback to user
        setTimeout(() => {
          toast?.({
            title: "🎉 Course Completed!",
            description: "Congratulations! Your certificate is being generated.",
          });
        }, 1000);
      }
      return true;
    } catch (error) {
      console.error("Error in trackLessonProgress:", error);
      return false;
    }
  },

  async checkCourseCompletion(userId: string, courseId: string, lessonProgress: number): Promise<boolean> {
    try {
      // Get course details to check the mode
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("mode")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError || !course) {
        console.error("Error fetching course:", courseError);
        return false;
      }

      // For self-paced courses, completion is based on lesson progress only (existing behavior)
      if (course.mode === 'self-paced' || !course.mode) {
        return lessonProgress >= 100;
      }

      // For virtual-live courses, check both lesson progress and attendance
      if (course.mode === 'virtual-live') {
        // Must complete all lessons
        if (lessonProgress < 100) {
          return false;
        }

        // Must meet attendance requirement (80% of live sessions)
        const attendanceProgress = await this.calculateAttendanceProgress(userId, courseId);
        return attendanceProgress >= 80; // 80% attendance requirement
      }

      // Default to lesson progress only for unknown modes
      return lessonProgress >= 100;
    } catch (error) {
      console.error("Error checking course completion:", error);
      return false;
    }
  },

  async calculateAttendanceProgress(userId: string, courseId: string): Promise<number> {
    try {
      // Get total number of class sessions for this course
      const { count: totalSessions } = await supabase
        .from("class_sessions")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId)
        .lte("start_time", new Date().toISOString()); // Only count past sessions

      if (!totalSessions || totalSessions === 0) {
        // If no sessions have occurred yet, return 100% (no attendance requirement)
        return 100;
      }

      // Get number of sessions the student attended
      const { count: attendedSessions } = await supabase
        .from("class_attendance")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .eq("attendance_status", "present");

      if (attendedSessions === undefined) {
        return 0;
      }

      // Calculate attendance percentage
      return Math.round((attendedSessions / totalSessions) * 100);
    } catch (error) {
      console.error("Error calculating attendance progress:", error);
      return 0;
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
  },

  async issueCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if course has certificates enabled
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('certificate_enabled')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) {
        console.error('Error fetching course for certificate check:', courseError);
        return false;
      }

      if (!course?.certificate_enabled) {
        return false;
      }

      // Avoid duplicate certificates
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('student_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existing) return true;

      const { data: newCert, error: insertError } = await supabase
        .from('certificates')
        .insert({ student_id: userId, course_id: courseId })
        .select()
        .single();

      if (insertError || !newCert) {
        console.error('Error creating certificate:', insertError);
        return false;
      }

      // Try generating PDF/URL (non-blocking)
      try {
        await supabase.functions.invoke('generate-certificate-pdf', {
          body: { certificateId: newCert.id },
        });
      } catch (genErr) {
        console.warn('Certificate created without PDF URL:', genErr);
      }

      return true;
    } catch (err) {
      console.error('Exception issuing certificate:', err);
      return false;
    }
  }
};
