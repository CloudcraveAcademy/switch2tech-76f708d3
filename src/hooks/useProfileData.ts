
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define interface for profile data
export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  country?: string;
  phone?: string;
  website?: string;
  job_title?: string;
  skills?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  student_status?: string;
  career_level?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow for additional properties
}

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch profile data
  const fetchProfileData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching profile data for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
        throw error;
      }

      console.log("Profile data fetched:", data);
      setProfileData(data);
    } catch (err: any) {
      console.error("Error in fetchProfileData:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfileData = async (updates: Partial<ProfileData>) => {
    if (!user?.id) {
      throw new Error("No authenticated user");
    }

    try {
      console.log("Updating profile with data:", updates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);
      setProfileData(prev => ({ ...prev, ...data } as ProfileData));
      return data;
    } catch (err) {
      console.error("Error in updateProfileData:", err);
      throw err;
    }
  };

  // Fetch profile data when user changes
  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  return {
    profileData,
    loading,
    error,
    fetchProfileData,
    updateProfileData,
  };
};
