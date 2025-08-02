import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrivacyService } from '@/services/PrivacyService';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Users, Lock } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: string;
  activityVisibility: string;
  showOnlineStatus: boolean;
}

export const PrivacyStatusCard = () => {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [isTestingPrivacy, setIsTestingPrivacy] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user) return;

      try {
        const settings = await PrivacyService.getUserPrivacySettings(user.id);
        if (settings) {
          setPrivacySettings(settings);
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      }
    };

    loadPrivacySettings();
  }, [user]);

  const testPrivacySettings = async () => {
    if (!user) return;

    setIsTestingPrivacy(true);
    try {
      // Test profile visibility
      const canViewOwnProfile = await PrivacyService.canViewProfile(user.id, user.id);
      const sanitizedProfile = await PrivacyService.getSanitizedProfile(user.id, user.id);
      
      setTestResult(`Privacy test completed. Profile visibility: ${canViewOwnProfile ? 'Accessible' : 'Restricted'}. Profile data sanitized: ${sanitizedProfile ? 'Yes' : 'No'}.`);
    } catch (error) {
      setTestResult('Failed to test privacy settings. Please try again.');
    } finally {
      setIsTestingPrivacy(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'everyone':
        return <Users className="h-4 w-4" />;
      case 'enrolled':
        return <Eye className="h-4 w-4" />;
      case 'instructors':
        return <Shield className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'everyone':
        return 'default';
      case 'enrolled':
        return 'secondary';
      case 'instructors':
        return 'outline';
      case 'private':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!privacySettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy Status
          </CardTitle>
          <CardDescription>Loading privacy settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Privacy Status
        </CardTitle>
        <CardDescription>
          Current privacy settings and their effects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded border">
            <div className="flex items-center space-x-2">
              {getVisibilityIcon(privacySettings.profileVisibility)}
              <span className="font-medium">Profile Visibility</span>
            </div>
            <Badge variant={getVisibilityColor(privacySettings.profileVisibility) as any}>
              {privacySettings.profileVisibility}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded border">
            <div className="flex items-center space-x-2">
              {getVisibilityIcon(privacySettings.activityVisibility)}
              <span className="font-medium">Activity Visibility</span>
            </div>
            <Badge variant={getVisibilityColor(privacySettings.activityVisibility) as any}>
              {privacySettings.activityVisibility}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded border">
            <div className="flex items-center space-x-2">
              {privacySettings.showOnlineStatus ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="font-medium">Online Status</span>
            </div>
            <Badge variant={privacySettings.showOnlineStatus ? 'default' : 'secondary'}>
              {privacySettings.showOnlineStatus ? 'Visible' : 'Hidden'}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-3">
            <p><strong>Profile Visibility:</strong> Controls who can see your basic profile information.</p>
            <p><strong>Activity Visibility:</strong> Controls who can see your course activity and social links.</p>
            <p><strong>Online Status:</strong> Controls whether others can see when you're online.</p>
          </div>

          <Button 
            onClick={testPrivacySettings}
            disabled={isTestingPrivacy}
            variant="outline"
            className="w-full"
          >
            {isTestingPrivacy ? 'Testing...' : 'Test Privacy Settings'}
          </Button>
          
          {testResult && (
            <div className="mt-2 p-2 rounded bg-muted">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};