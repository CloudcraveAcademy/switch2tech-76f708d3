
import { supabase } from "@/integrations/supabase/client";

export class EnrollmentService {
  static async enrollUserInCourse(
    userId: string, 
    courseId: string, 
    transactionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', userId)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        return { success: false, error: 'User is already enrolled in this course' };
      }

      // Create enrollment record
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: userId,
          course_id: courseId,
          enrollment_date: new Date().toISOString(),
          progress: 0,
          completed: false
        });

      if (enrollmentError) {
        console.error('Enrollment error:', enrollmentError);
        return { success: false, error: 'Failed to create enrollment record' };
      }

      // Create payment transaction record
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_reference: transactionId,
          status: 'successful',
          amount: 0, // Will be updated with actual amount
          currency: 'NGN'
        });

      if (paymentError) {
        console.error('Payment transaction error:', paymentError);
        // Note: We might want to rollback enrollment here
        return { success: false, error: 'Failed to record payment transaction' };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error during enrollment:', error);
      return { success: false, error: 'An unexpected error occurred during enrollment' };
    }
  }
}
