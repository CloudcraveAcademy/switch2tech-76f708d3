
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData({
        ...data,
        preferences: typeof data.preferences === "string"
          ? JSON.parse(data.preferences)
          : data.preferences || {}
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (updates: Partial<ProfileData>) => {
    if (!user?.id) throw new Error("No authenticated user");
    try {
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
        .single();

      if (error) throw error;
      setProfileData(prev => ({ ...prev, ...data, preferences: typeof data.preferences === "string" ? JSON.parse(data.preferences) : data.preferences }));
      return data;
    } catch (err) {
      throw err;
    }
  };

  const verifyBankAccount = async () => {
    if (!user?.id || !profileData?.bank_name || !profileData?.account_number) {
      throw new Error("Missing bank details");
    }
    try {
      const updatedProfile = await updateProfileData({
        bank_verification_status: 'verified',
        account_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        paystack_recipient_code: `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
      return updatedProfile;
    } catch (err) {
      throw err;
    }
  };

  const updatePreferences = async (preferences: Record<string, boolean>) => {
    if (!user?.id) throw new Error("No authenticated user");
    try {
      const currentPrefs = profileData?.preferences || {};
      const updatedPreferences = { ...currentPrefs, ...preferences };
      return await updateProfileData({ preferences: updatedPreferences });
    } catch (err) {
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
    verifyBankAccount,
    updatePreferences,
  };
}
