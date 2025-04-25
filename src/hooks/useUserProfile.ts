
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserWithProfile } from "@/types/auth";

export const useUserProfile = () => {
  const enrichUserWithProfile = async (user: User | null): Promise<UserWithProfile | null> => {
    if (!user) return null;
    
    try {
      console.log("Fetching profile for user:", user.id);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, role, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error || !profile) {
        console.error("Error fetching user profile:", error);
        return user as UserWithProfile;
      }
      
      console.log("Profile data fetched:", profile);
      return {
        ...user,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
        avatar: profile.avatar_url,
        role: profile.role as UserWithProfile['role']
      };
    } catch (error) {
      console.error("Error enriching user data:", error);
      return user as UserWithProfile;
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
