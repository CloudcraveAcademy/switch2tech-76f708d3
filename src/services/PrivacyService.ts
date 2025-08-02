import { supabase } from "@/integrations/supabase/client";

export interface UserPrivacySettings {
  profileVisibility: 'everyone' | 'enrolled' | 'instructors' | 'private';
  activityVisibility: 'everyone' | 'enrolled' | 'instructors' | 'private';
  showOnlineStatus: boolean;
}

export class PrivacyService {
  // Get user privacy settings
  static async getUserPrivacySettings(userId: string): Promise<UserPrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const preferences = data?.preferences as any;
      
      return preferences?.privacySettings || {
        profileVisibility: 'everyone',
        activityVisibility: 'enrolled',
        showOnlineStatus: true,
      };
    } catch (error) {
      console.error('Failed to get user privacy settings:', error);
      return null;
    }
  }

  // Check if user's profile should be visible to viewer
  static async canViewProfile(profileUserId: string, viewerUserId: string): Promise<boolean> {
    try {
      // Same user can always view their own profile
      if (profileUserId === viewerUserId) return true;

      const privacySettings = await this.getUserPrivacySettings(profileUserId);
      if (!privacySettings) return true; // Default to visible if no settings

      switch (privacySettings.profileVisibility) {
        case 'everyone':
          return true;
        case 'private':
          return false;
        case 'instructors':
          return this.isInstructor(viewerUserId);
        case 'enrolled':
          return this.areInSameCourse(profileUserId, viewerUserId);
        default:
          return true;
      }
    } catch (error) {
      console.error('Failed to check profile visibility:', error);
      return false;
    }
  }

  // Check if user's activity should be visible to viewer
  static async canViewActivity(profileUserId: string, viewerUserId: string): Promise<boolean> {
    try {
      // Same user can always view their own activity
      if (profileUserId === viewerUserId) return true;

      const privacySettings = await this.getUserPrivacySettings(profileUserId);
      if (!privacySettings) return true; // Default to visible if no settings

      switch (privacySettings.activityVisibility) {
        case 'everyone':
          return true;
        case 'private':
          return false;
        case 'instructors':
          return this.isInstructor(viewerUserId);
        case 'enrolled':
          return this.areInSameCourse(profileUserId, viewerUserId);
        default:
          return true;
      }
    } catch (error) {
      console.error('Failed to check activity visibility:', error);
      return false;
    }
  }

  // Check if online status should be shown
  static async shouldShowOnlineStatus(profileUserId: string, viewerUserId: string): Promise<boolean> {
    try {
      // Same user can always see their own status
      if (profileUserId === viewerUserId) return true;

      const privacySettings = await this.getUserPrivacySettings(profileUserId);
      if (!privacySettings) return true; // Default to showing status

      return privacySettings.showOnlineStatus;
    } catch (error) {
      console.error('Failed to check online status visibility:', error);
      return false;
    }
  }

  // Helper: Check if user is an instructor
  private static async isInstructor(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.role === 'instructor' || data?.role === 'admin' || data?.role === 'super_admin';
    } catch (error) {
      console.error('Failed to check if user is instructor:', error);
      return false;
    }
  }

  // Helper: Check if two users are in the same course
  private static async areInSameCourse(userId1: string, userId2: string): Promise<boolean> {
    try {
      // Get courses where user1 is enrolled or teaching
      const { data: user1Courses, error: error1 } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', userId1);

      const { data: user1TaughtCourses, error: error2 } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', userId1);

      if (error1 || error2) throw error1 || error2;

      const user1CourseIds = [
        ...(user1Courses?.map(e => e.course_id) || []),
        ...(user1TaughtCourses?.map(c => c.id) || [])
      ];

      // Get courses where user2 is enrolled or teaching
      const { data: user2Courses, error: error3 } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', userId2);

      const { data: user2TaughtCourses, error: error4 } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', userId2);

      if (error3 || error4) throw error3 || error4;

      const user2CourseIds = [
        ...(user2Courses?.map(e => e.course_id) || []),
        ...(user2TaughtCourses?.map(c => c.id) || [])
      ];

      // Check if they have any courses in common
      return user1CourseIds.some(courseId => user2CourseIds.includes(courseId));
    } catch (error) {
      console.error('Failed to check if users are in same course:', error);
      return false;
    }
  }

  // Filter user profiles based on privacy settings
  static async filterVisibleProfiles(profiles: any[], viewerUserId: string): Promise<any[]> {
    const visibleProfiles = [];

    for (const profile of profiles) {
      const canView = await this.canViewProfile(profile.id, viewerUserId);
      if (canView) {
        visibleProfiles.push(profile);
      }
    }

    return visibleProfiles;
  }

  // Get sanitized profile based on privacy settings
  static async getSanitizedProfile(profileUserId: string, viewerUserId: string): Promise<any> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();

      if (error) throw error;

      const canViewProfile = await this.canViewProfile(profileUserId, viewerUserId);
      const canViewActivity = await this.canViewActivity(profileUserId, viewerUserId);
      const showOnlineStatus = await this.shouldShowOnlineStatus(profileUserId, viewerUserId);

      if (!canViewProfile) {
        return {
          id: profile.id,
          first_name: 'Private',
          last_name: 'User',
          avatar_url: null,
          bio: null,
          isPrivate: true
        };
      }

      const sanitizedProfile = { ...profile };

      if (!canViewActivity) {
        // Remove activity-related information
        delete sanitizedProfile.linkedin_url;
        delete sanitizedProfile.github_url;
        delete sanitizedProfile.twitter_url;
        delete sanitizedProfile.website;
        delete sanitizedProfile.skills;
      }

      if (!showOnlineStatus) {
        (sanitizedProfile as any).hideOnlineStatus = true;
      }

      return sanitizedProfile;
    } catch (error) {
      console.error('Failed to get sanitized profile:', error);
      return null;
    }
  }
}