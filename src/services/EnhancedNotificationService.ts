import { supabase } from "@/integrations/supabase/client";
import { NotificationService, CreateNotificationParams } from "./NotificationService";

export interface UserNotificationPreferences {
  emailSettings: {
    courseUpdates: boolean;
    assignments: boolean;
    announcements: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  pushSettings: {
    courseUpdates: boolean;
    newMessages: boolean;
    assignments: boolean;
    reminders: boolean;
  };
}

export class EnhancedNotificationService extends NotificationService {
  // Get user notification preferences
  static async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const preferences = data?.preferences as any;
      
      return preferences ? {
        emailSettings: preferences.emailSettings || {
          courseUpdates: true,
          assignments: true,
          announcements: true,
          reminders: true,
          marketing: false,
        },
        pushSettings: preferences.pushSettings || {
          courseUpdates: true,
          newMessages: true,
          assignments: true,
          reminders: true,
        }
      } : null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  // Enhanced notification creation that respects user preferences
  static async createNotificationWithPreferences(params: CreateNotificationParams) {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(params.user_id);
      
      // If no preferences found, create notification anyway (default behavior)
      if (!preferences) {
        return this.createNotification(params);
      }

      // Check if this type of notification is enabled
      const shouldSend = this.shouldSendNotification(params.type, preferences);
      
      if (!shouldSend) {
        console.log(`Notification skipped for user ${params.user_id} due to preferences:`, params.type);
        return null;
      }

      // Create the notification
      return this.createNotification(params);
    } catch (error) {
      console.error('Failed to create notification with preferences:', error);
      throw error;
    }
  }

  // Check if notification should be sent based on user preferences
  private static shouldSendNotification(type: string, preferences: UserNotificationPreferences): boolean {
    const { emailSettings, pushSettings } = preferences;

    switch (type) {
      case 'assignment':
        return emailSettings.assignments && pushSettings.assignments;
      case 'announcement':
        return emailSettings.announcements && pushSettings.courseUpdates;
      case 'course_update':
      case 'enrollment':
        return emailSettings.courseUpdates && pushSettings.courseUpdates;
      case 'live_class':
      case 'reminder':
        return emailSettings.reminders && pushSettings.reminders;
      case 'grade':
      case 'quiz':
      case 'certificate':
        return emailSettings.courseUpdates && pushSettings.courseUpdates;
      case 'new_message':
        return pushSettings.newMessages;
      case 'marketing':
        return emailSettings.marketing;
      default:
        // For unknown types, default to sending if course updates are enabled
        return emailSettings.courseUpdates && pushSettings.courseUpdates;
    }
  }

  // Enhanced bulk notifications that respect preferences
  static async notifyAllCourseStudentsWithPreferences(
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
      
      if (!enrollments || enrollments.length === 0) return [];

      // Create notifications only for users who have this type enabled
      const notificationsToCreate = [];
      
      for (const enrollment of enrollments) {
        const preferences = await this.getUserPreferences(enrollment.student_id);
        
        if (!preferences || this.shouldSendNotification(type, preferences)) {
          notificationsToCreate.push({
            user_id: enrollment.student_id,
            type,
            title,
            description,
            action_url: actionUrl,
            course_id: courseId,
          });
        }
      }

      if (notificationsToCreate.length === 0) return [];

      return this.createMultipleNotifications(notificationsToCreate);
    } catch (error) {
      console.error('Failed to notify course students with preferences:', error);
      throw error;
    }
  }

  // Override existing methods to use preference-aware sending
  static async notifyStudentEnrollment(studentId: string, courseTitle: string, courseId: string) {
    return this.createNotificationWithPreferences({
      user_id: studentId,
      type: 'enrollment',
      title: 'Course Enrollment Confirmed',
      description: `You have successfully enrolled in "${courseTitle}"`,
      action_url: `/dashboard/my-courses`,
      course_id: courseId,
    });
  }

  static async notifyStudentAssignment(studentId: string, assignmentTitle: string, courseTitle: string, courseId: string) {
    return this.createNotificationWithPreferences({
      user_id: studentId,
      type: 'assignment',
      title: 'New Assignment Available',
      description: `"${assignmentTitle}" has been posted in ${courseTitle}`,
      action_url: `/course/${courseId}/assignments`,
      course_id: courseId,
    });
  }

  static async notifyStudentAnnouncement(studentId: string, title: string, courseTitle: string, courseId: string) {
    return this.createNotificationWithPreferences({
      user_id: studentId,
      type: 'announcement',
      title: 'Course Announcement',
      description: `New announcement in ${courseTitle}: ${title}`,
      action_url: `/course/${courseId}`,
      course_id: courseId,
    });
  }

  static async notifyStudentLiveClass(studentId: string, topic: string, startTime: string, courseId: string) {
    return this.createNotificationWithPreferences({
      user_id: studentId,
      type: 'live_class',
      title: 'Live Class Reminder',
      description: `"${topic}" starts at ${new Date(startTime).toLocaleString()}`,
      action_url: `/dashboard/live-classes`,
      course_id: courseId,
    });
  }

  static async notifyStudentGrade(studentId: string, assignmentTitle: string, score: number, maxScore: number, courseId: string) {
    return this.createNotificationWithPreferences({
      user_id: studentId,
      type: 'grade',
      title: 'Assignment Graded',
      description: `Your assignment "${assignmentTitle}" has been graded: ${score}/${maxScore}`,
      action_url: `/course/${courseId}/assignments`,
      course_id: courseId,
    });
  }
}