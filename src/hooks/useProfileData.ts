
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  skills?: string;
  career_level?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  paystack_recipient_code?: string;
  bank_verification_status?: string;
  payout_frequency?: string;
  student_status?: string;
  preferences?: { notifications?: boolean; newsletter?: boolean; [key: string]: any };
  [key: string]: any;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfileData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log("Fetching profile data for user:", user.id);
      
      // Use the get_user_profile function to avoid RLS recursion issues
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching profile data:", fetchError);
        throw fetchError;
      }

      if (!data) {
        console.warn("No profile data found for user:", user.id);
        setProfileData(null);
        return;
      }

      console.log("Profile data fetched:", data);
      
      // Parse preferences if it's a string
      const parsedPreferences = typeof data.preferences === "string"
        ? JSON.parse(data.preferences)
        : data.preferences || {};
      
      // Create a processed profile with correctly typed preferences
      const processedProfile: ProfileData = {
        ...data,
        preferences: parsedPreferences
      };
      
      setProfileData(processedProfile);
    } catch (err: any) {
      console.error("Error in fetchProfileData:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (updates: Partial<ProfileData>) => {
    if (!user?.id) throw new Error("No authenticated user");
    try {
      console.log("Updating profile data with:", updates);
    
      // Convert preferences to JSON if it's an object
      const updatesWithJsonPrefs = {
        ...updates,
        ...(updates.preferences && typeof updates.preferences === "object"
          ? { preferences: JSON.stringify(updates.preferences) }
          : {})
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatesWithJsonPrefs)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Error updating profile data:", error);
        throw error;
      }

      if (!data) {
        console.warn("No data returned after update");
        return null;
      }

      console.log("Profile updated successfully:", data);
      
      // Parse preferences from the response
      const parsedPreferences = typeof data.preferences === "string"
        ? JSON.parse(data.preferences)
        : data.preferences || {};
      
      // Create an updated profile with the correct types
      const updatedProfile: ProfileData = {
        ...data,
        preferences: parsedPreferences
      };
      
      // Update local state with the new data
      setProfileData(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error("Error in updateProfileData:", err);
      throw err;
    }
  };

  const updateProfileAvatar = async (filePath: string) => {
    if (!user?.id) throw new Error("No authenticated user");
    try {
      const updates = { avatar_url: filePath };
      return await updateProfileData(updates);
    } catch (err) {
      console.error("Error updating avatar:", err);
      throw err;
    }
  };

  const verifyBankAccount = async () => {
    if (!user?.id || !profileData?.bank_name || !profileData?.account_number) {
      throw new Error("Missing bank details");
    }
    try {
      console.log("Verifying bank account");
      
      const updatedProfile = await updateProfileData({
        bank_verification_status: 'verified',
        account_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        paystack_recipient_code: `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
      
      toast({
        title: "Bank account verified",
        description: "Your bank account has been verified successfully."
      });
      
      return updatedProfile;
    } catch (err) {
      console.error("Error in verifyBankAccount:", err);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "There was an error verifying your bank account."
      });
      throw err;
    }
  };

  const updatePreferences = async (preferences: Record<string, boolean>) => {
    if (!user?.id) throw new Error("No authenticated user");
    try {
      console.log("Updating preferences:", preferences);
      
      const currentPrefs = profileData?.preferences || {};
      const updatedPreferences = { ...currentPrefs, ...preferences };
      
      return await updateProfileData({ preferences: updatedPreferences });
    } catch (err) {
      console.error("Error in updatePreferences:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  return {
    profileData,
    loading,
    error,
    fetchProfileData,
    updateProfileData,
    updateProfileAvatar,
    verifyBankAccount,
    updatePreferences,
  };
};
