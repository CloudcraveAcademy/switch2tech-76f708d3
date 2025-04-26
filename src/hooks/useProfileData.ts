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
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  paystack_recipient_code?: string;
  bank_verification_status?: string;
  payout_frequency?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow for additional properties
}

// Update profile data to allow avatar updates to work with public url

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

  // Update profileData function: let avatar_url update propagate correctly
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

      setProfileData(prev => ({ ...prev, ...data } as ProfileData));
      return data;
    } catch (err) {
      console.error("Error in updateProfileData:", err);
      throw err;
    }
  };

  // Verify bank account (for instructors)
  const verifyBankAccount = async () => {
    if (!user?.id || !profileData?.bank_name || !profileData?.account_number) {
      throw new Error("Missing bank details");
    }

    try {
      // This would typically call a Paystack API via an edge function
      // For now, we'll simulate a successful verification
      const updatedProfile = await updateProfileData({
        bank_verification_status: 'verified',
        account_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        paystack_recipient_code: `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });

      return updatedProfile;
    } catch (err) {
      console.error("Error in verifyBankAccount:", err);
      throw err;
    }
  };

  // Update preferences
  const updatePreferences = async (preferences: Record<string, boolean>) => {
    if (!user?.id) {
      throw new Error("No authenticated user");
    }

    try {
      const currentPrefs = profileData?.preferences || {};
      const updatedPreferences = { ...currentPrefs, ...preferences };
      
      return await updateProfileData({ preferences: updatedPreferences });
    } catch (err) {
      console.error("Error in updatePreferences:", err);
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
    verifyBankAccount,
    updatePreferences,
  };
};
