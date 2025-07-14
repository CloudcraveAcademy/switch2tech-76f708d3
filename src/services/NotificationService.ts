import { supabase } from "@/integrations/supabase/client";

export interface CreateNotificationParams {
  user_id: string;
  type: string;
  title: string;
  description: string;
  action_url?: string;
  course_id?: string;
  instructor_id?: string;
  metadata?: any;
}

export class NotificationService {
  // Create a single notification
  static async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(params)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Create multiple notifications
  static async createMultipleNotifications(notifications: CreateNotificationParams[]) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create multiple notifications:', error);
      throw error;
    }
  }

  // Notification templates for common actions
  
  // Student notifications
  static async notifyStudentEnrollment(studentId: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'enrollment',
      title: 'Course Enrollment Confirmed',
      description: `You have successfully enrolled in "${courseTitle}"`,
      action_url: `/dashboard/my-courses`,
      course_id: courseId,
    });
  }

  static async notifyStudentAssignment(studentId: string, assignmentTitle: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'assignment',
      title: 'New Assignment Available',
      description: `"${assignmentTitle}" has been posted in ${courseTitle}`,
      action_url: `/course/${courseId}/assignments`,
      course_id: courseId,
    });
  }

  static async notifyStudentGrade(studentId: string, assignmentTitle: string, score: number, maxScore: number, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'grade',
      title: 'Assignment Graded',
      description: `Your assignment "${assignmentTitle}" has been graded: ${score}/${maxScore}`,
      action_url: `/course/${courseId}/assignments`,
      course_id: courseId,
    });
  }

  static async notifyStudentQuiz(studentId: string, quizTitle: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'quiz',
      title: 'New Quiz Available',
      description: `"${quizTitle}" is now available in ${courseTitle}`,
      action_url: `/course/${courseId}/quizzes`,
      course_id: courseId,
    });
  }

  static async notifyStudentLiveClass(studentId: string, topic: string, startTime: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'live_class',
      title: 'Live Class Reminder',
      description: `"${topic}" starts at ${new Date(startTime).toLocaleString()}`,
      action_url: `/dashboard/live-classes`,
      course_id: courseId,
    });
  }

  static async notifyStudentCertificate(studentId: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'certificate',
      title: 'Certificate Issued',
      description: `Your certificate for "${courseTitle}" is ready for download`,
      action_url: `/dashboard/certificates`,
      course_id: courseId,
    });
  }

  static async notifyStudentAnnouncement(studentId: string, title: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: studentId,
      type: 'announcement',
      title: 'Course Announcement',
      description: `New announcement in ${courseTitle}: ${title}`,
      action_url: `/course/${courseId}`,
      course_id: courseId,
    });
  }

  // Instructor notifications
  static async notifyInstructorEnrollment(instructorId: string, studentName: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      user_id: instructorId,
      type: 'new_enrollment',
      title: 'New Student Enrollment',
      description: `${studentName} has enrolled in "${courseTitle}"`,
      action_url: `/dashboard/students`,
      course_id: courseId,
    });
  }

  static async notifyInstructorSubmission(instructorId: string, studentName: string, assignmentTitle: string, courseId: string) {
    return this.createNotification({
      user_id: instructorId,
      type: 'submission',
      title: 'New Assignment Submission',
      description: `${studentName} submitted "${assignmentTitle}"`,
      action_url: `/dashboard/instructor/assignments`,
      course_id: courseId,
    });
  }

  static async notifyInstructorQuizSubmission(instructorId: string, studentName: string, quizTitle: string, courseId: string) {
    return this.createNotification({
      user_id: instructorId,
      type: 'quiz_submission',
      title: 'New Quiz Submission',
      description: `${studentName} completed "${quizTitle}"`,
      action_url: `/dashboard/instructor/quizzes`,
      course_id: courseId,
    });
  }

  // Admin notifications
  static async notifyAdminUserRegistration(adminId: string, userName: string, userRole: string) {
    return this.createNotification({
      user_id: adminId,
      type: 'user_registration',
      title: 'New User Registration',
      description: `New ${userRole} registered: ${userName}`,
      action_url: `/dashboard/admin/users`,
    });
  }

  static async notifyAdminCourseCreation(adminId: string, courseTitle: string, instructorName: string, courseId: string) {
    return this.createNotification({
      user_id: adminId,
      type: 'course_creation',
      title: 'New Course Created',
      description: `"${courseTitle}" created by ${instructorName}`,
      action_url: `/dashboard/admin/courses`,
      course_id: courseId,
    });
  }

  static async notifyAdminSupportTicket(adminId: string, ticketSubject: string, userName: string) {
    return this.createNotification({
      user_id: adminId,
      type: 'support_ticket',
      title: 'New Support Ticket',
      description: `"${ticketSubject}" from ${userName}`,
      action_url: `/dashboard/admin/support`,
    });
  }

  // Payout notifications for instructors
  static async notifyInstructorPayoutCreated(instructorId: string, amount: number, currency: string = 'USD') {
    return this.createNotification({
      user_id: instructorId,
      type: 'payment',
      title: 'New Payout Created',
      description: `A new payout of ${currency} ${amount.toFixed(2)} has been created for you`,
      action_url: `/dashboard/instructor/payouts`,
      metadata: { amount, currency, action: 'payout_created' }
    });
  }

  static async notifyInstructorPayoutProcessing(instructorId: string, amount: number, currency: string = 'USD') {
    return this.createNotification({
      user_id: instructorId,
      type: 'payment',
      title: 'Payout Being Processed',
      description: `Your payout of ${currency} ${amount.toFixed(2)} is now being processed`,
      action_url: `/dashboard/instructor/payouts`,
      metadata: { amount, currency, action: 'payout_processing' }
    });
  }

  static async notifyInstructorPayoutPaid(instructorId: string, amount: number, currency: string = 'USD', reference?: string) {
    return this.createNotification({
      user_id: instructorId,
      type: 'payment',
      title: 'Payout Completed',
      description: `Your payout of ${currency} ${amount.toFixed(2)} has been successfully processed${reference ? ` (Ref: ${reference})` : ''}`,
      action_url: `/dashboard/instructor/payouts`,
      metadata: { amount, currency, reference, action: 'payout_paid' }
    });
  }

  static async notifyInstructorPayoutCancelled(instructorId: string, amount: number, currency: string = 'USD', reason?: string) {
    return this.createNotification({
      user_id: instructorId,
      type: 'payment',
      title: 'Payout Cancelled',
      description: `Your payout of ${currency} ${amount.toFixed(2)} has been cancelled${reason ? `. Reason: ${reason}` : ''}`,
      action_url: `/dashboard/instructor/payouts`,
      metadata: { amount, currency, reason, action: 'payout_cancelled' }
    });
  }

  // Bulk notifications for course students
  static async notifyAllCourseStudents(
    courseId: string, 
    type: string, 
    title: string, 
    description: string,
    actionUrl?: string
  ) {
    try {
      // Get all enrolled students for the course
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId);
        
      if (error) throw error;
      
      if (!enrollments || enrollments.length === 0) return;

      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.student_id,
        type,
        title,
        description,
        action_url: actionUrl,
        course_id: courseId,
      }));

      return this.createMultipleNotifications(notifications);
    } catch (error) {
      console.error('Failed to notify course students:', error);
      throw error;
    }
  }
}