
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserWithProfile } from '@/types/auth';

export const useUserProfile = () => {
  // Simple cache to reduce duplicate requests
  const profileCache = new Map<string, {data: any, timestamp: number}>();
  const CACHE_TTL = 60000; // 1 minute cache TTL
  
  const enrichUserWithProfile = async (user: User | null): Promise<UserWithProfile | null> => {
    if (!user) return null;
    
    try {
      // Check cache first
      const cachedProfile = profileCache.get(user.id);
      const now = Date.now();
      
      if (cachedProfile && (now - cachedProfile.timestamp < CACHE_TTL)) {
        console.log("Using cached profile for user:", user.id);
        const profile = cachedProfile.data;
        return {
          ...user,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
          avatar: profile.avatar_url,
          role: profile.role as UserWithProfile['role']
        };
      }
      
      console.log("Fetching profile for user:", user.id);
      
      // Simpler fetch with shorter timeout
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, role, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        
        // Return user with role from user metadata as fallback
        const fallbackRole = user.user_metadata?.role || 'student';
        return {
          ...user,
          role: fallbackRole as UserWithProfile['role']
        } as UserWithProfile;
      }
      
      console.log("Profile data fetched:", profile);
      
      // Cache the result
      profileCache.set(user.id, {
        data: profile,
        timestamp: now
      });
      
      return {
        ...user,
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined : undefined,
        avatar: profile?.avatar_url,
        role: (profile?.role as UserWithProfile['role']) || 'student'
      };
    } catch (error) {
      console.error("Error enriching user data:", error);
      
      // Return user with role from user metadata as fallback
      const fallbackRole = user.user_metadata?.role || 'student';
      return {
        ...user,
        role: fallbackRole as UserWithProfile['role']
      } as UserWithProfile;
    }
  };
  
  const updateUserProfile = async (userId: string, updates: Partial<UserWithProfile>) => {
    if (!userId) return null;
    
    try {
      // Extract profile specific fields
      const { name, avatar, ...otherUpdates } = updates;
      const nameParts = name ? name.split(' ') : [];
      
      const profileUpdates: Record<string, any> = {};
      if (name) {
        profileUpdates.first_name = nameParts[0] || '';
        profileUpdates.last_name = nameParts.slice(1).join(' ') || '';
      }
      if (avatar) {
        profileUpdates.avatar_url = avatar;
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
      
      // Update cache with new data
      profileCache.delete(userId);
      
      return data;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      throw error;
    }
  };

  return { 
    enrichUserWithProfile,
    updateUserProfile
  };
};
