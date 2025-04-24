
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
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        avatar: profile.avatar_url,
        role: profile.role as UserWithProfile['role']
      };
    } catch (error) {
      console.error("Error enriching user data:", error);
      return user as UserWithProfile;
    }
  };

  return { enrichUserWithProfile };
};
