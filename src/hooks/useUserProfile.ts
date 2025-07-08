
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserWithProfile } from '@/types/auth';

export const useUserProfile = () => {
  // Cache to prevent duplicate fetches for the same user ID
  const profileCache = new Map<string, {data: any, timestamp: number}>();
  const CACHE_TTL = 30000; // 30 seconds cache TTL
  
  const enrichUserWithProfile = async (user: User | null): Promise<UserWithProfile | null> => {
    if (!user) return null;
    
    try {
      // Check cache first to reduce database calls
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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('id, first_name, last_name, role, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      
      const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error("Error fetching user profile:", error);
        
        // Return basic user information as fallback
        return {
          ...user,
          role: 'student' // Default role if profile can't be fetched
        } as UserWithProfile;
      }
      
      console.log("Profile data fetched:", profile);
      
      // Cache the result
      if (profile) {
        profileCache.set(user.id, {
          data: profile,
          timestamp: now
        });
      }
      
      return {
        ...user,
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined : undefined,
        avatar: profile?.avatar_url,
        role: (profile?.role as UserWithProfile['role']) || 'student'
      };
    } catch (error) {
      console.error("Error enriching user data:", error);
      // Return basic user information even if there's an exception
      return {
        ...user,
        role: 'student' // Default role as fallback
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
