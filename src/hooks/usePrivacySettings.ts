import { useState, useEffect } from 'react';
import { PrivacyService, UserPrivacySettings } from '@/services/PrivacyService';
import { useAuth } from '@/contexts/AuthContext';

export const usePrivacySettings = () => {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const settings = await PrivacyService.getUserPrivacySettings(user.id);
        setPrivacySettings(settings);
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrivacySettings();
  }, [user]);

  const checkProfileVisibility = async (profileUserId: string) => {
    if (!user) return false;
    return PrivacyService.canViewProfile(profileUserId, user.id);
  };

  const checkActivityVisibility = async (profileUserId: string) => {
    if (!user) return false;
    return PrivacyService.canViewActivity(profileUserId, user.id);
  };

  const checkOnlineStatusVisibility = async (profileUserId: string) => {
    if (!user) return false;
    return PrivacyService.shouldShowOnlineStatus(profileUserId, user.id);
  };

  const getSanitizedProfile = async (profileUserId: string) => {
    if (!user) return null;
    return PrivacyService.getSanitizedProfile(profileUserId, user.id);
  };

  return {
    privacySettings,
    loading,
    checkProfileVisibility,
    checkActivityVisibility,
    checkOnlineStatusVisibility,
    getSanitizedProfile,
  };
};