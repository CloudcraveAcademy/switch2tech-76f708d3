
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Bell,
  Mail,
  Lock,
  Shield,
  Settings as SettingsIcon,
  Eye,
  Languages,
  Laptop,
  Trash2,
  LogOut,
  Palette,
  BookOpen,
  Database,
  Link,
  Download
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { profileData, updateProfileData, loading } = useProfileData();
  
  const [emailSettings, setEmailSettings] = useState({
    courseUpdates: true,
    assignments: true,
    announcements: true,
    reminders: true,
    marketing: false,
  });

  const [pushSettings, setPushSettings] = useState({
    courseUpdates: true,
    newMessages: true,
    assignments: true,
    reminders: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "everyone",
    activityVisibility: "enrolled",
    showOnlineStatus: true,
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reduceMotion: false,
    contrastMode: false,
    largerText: false,
    autoplay: true,
  });

  const [languageSettings, setLanguageSettings] = useState({
    interface: "en",
    content: "en", 
    timezone: "UTC",
  });

  const [themeSettings, setThemeSettings] = useState({
    mode: "system",
    accentColor: "blue",
    compactMode: false,
  });

  const [learningSettings, setLearningSettings] = useState({
    defaultPlaybackSpeed: "1x",
    autoProgress: true,
    bookmarks: true,
    downloadQuality: "high",
  });

  const [dataSettings, setDataSettings] = useState({
    analytics: true,
    cookies: true,
    dataRetention: "1year",
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    calendar: false,
    slack: false,
    github: false,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: false,
    frequency: "weekly",
    includeProgress: true,
  });

  // Load settings from user preferences when component mounts
  useEffect(() => {
    if (profileData?.preferences) {
      const prefs = profileData.preferences;
      
      // Load email settings
      if (prefs.emailSettings) {
        setEmailSettings({ ...emailSettings, ...prefs.emailSettings });
      }
      
      // Load push settings
      if (prefs.pushSettings) {
        setPushSettings({ ...pushSettings, ...prefs.pushSettings });
      }
      
      // Load privacy settings
      if (prefs.privacySettings) {
        setPrivacySettings({ ...privacySettings, ...prefs.privacySettings });
      }
      
      // Load accessibility settings
      if (prefs.accessibilitySettings) {
        setAccessibilitySettings({ ...accessibilitySettings, ...prefs.accessibilitySettings });
      }

      // Load language settings
      if (prefs.languageSettings) {
        setLanguageSettings({ ...languageSettings, ...prefs.languageSettings });
      }

      // Load theme settings
      if (prefs.themeSettings) {
        setThemeSettings({ ...themeSettings, ...prefs.themeSettings });
      }

      // Load learning settings
      if (prefs.learningSettings) {
        setLearningSettings({ ...learningSettings, ...prefs.learningSettings });
      }

      // Load data settings
      if (prefs.dataSettings) {
        setDataSettings({ ...dataSettings, ...prefs.dataSettings });
      }

      // Load integration settings
      if (prefs.integrationSettings) {
        setIntegrationSettings({ ...integrationSettings, ...prefs.integrationSettings });
      }

      // Load backup settings
      if (prefs.backupSettings) {
        setBackupSettings({ ...backupSettings, ...prefs.backupSettings });
      }
    }
  }, [profileData]);

  const handleEmailSettingsChange = (setting: keyof typeof emailSettings) => {
    setEmailSettings({
      ...emailSettings,
      [setting]: !emailSettings[setting],
    });
  };

  const handlePushSettingsChange = (setting: keyof typeof pushSettings) => {
    setPushSettings({
      ...pushSettings,
      [setting]: !pushSettings[setting],
    });
  };

  const handlePrivacyChange = (setting: keyof typeof privacySettings, value: any) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: value,
    });
  };

  const handleAccessibilityChange = (setting: keyof typeof accessibilitySettings) => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      [setting]: !accessibilitySettings[setting],
    });
  };

  const saveNotificationSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          emailSettings,
          pushSettings,
        }
      });
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const savePrivacySettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          privacySettings,
        }
      });
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveAccessibilitySettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          accessibilitySettings,
        }
      });
      toast({
        title: "Accessibility settings updated",
        description: "Your accessibility preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveLanguageSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          languageSettings,
        }
      });
      toast({
        title: "Language settings updated",
        description: "Your language preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveThemeSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          themeSettings,
        }
      });
      toast({
        title: "Theme settings updated",
        description: "Your theme preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveLearningSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          learningSettings,
        }
      });
      toast({
        title: "Learning settings updated",
        description: "Your learning preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveDataSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          dataSettings,
        }
      });
      toast({
        title: "Data settings updated",
        description: "Your data preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveIntegrationSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          integrationSettings,
        }
      });
      toast({
        title: "Integration settings updated",
        description: "Your integration preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveBackupSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          backupSettings,
        }
      });
      toast({
        title: "Backup settings updated",
        description: "Your backup preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out from all devices.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Send deletion request email or mark for deletion
      const { error } = await supabase.functions.invoke('send-account-deletion-email', {
        body: { userId: user?.id }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account deletion requested",
        description: "Please check your email to confirm account deletion. This process may take up to 30 days to complete.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Account deletion request failed:', error);
      toast({
        title: "Request failed",
        description: "We couldn't process your deletion request. Please contact support for assistance.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="notifications" className="space-y-8">
        <div className="border-b">
          <TabsList className="w-full justify-start h-auto p-0">
            <TabsTrigger 
              value="notifications" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger 
              value="accessibility" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger 
              value="language" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Languages className="h-4 w-4 mr-2" />
              Language
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Database className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Link className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger 
              value="backup" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Shield className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Configure which emails you receive from our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="courseUpdates">Course updates and announcements</Label>
                    <Switch 
                      id="courseUpdates" 
                      checked={emailSettings.courseUpdates}
                      onCheckedChange={() => handleEmailSettingsChange("courseUpdates")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assignmentsEmail">New assignments and deadlines</Label>
                    <Switch 
                      id="assignmentsEmail" 
                      checked={emailSettings.assignments}
                      onCheckedChange={() => handleEmailSettingsChange("assignments")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="announcementsEmail">Platform announcements</Label>
                    <Switch 
                      id="announcementsEmail" 
                      checked={emailSettings.announcements}
                      onCheckedChange={() => handleEmailSettingsChange("announcements")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remindersEmail">Class reminders</Label>
                    <Switch 
                      id="remindersEmail" 
                      checked={emailSettings.reminders}
                      onCheckedChange={() => handleEmailSettingsChange("reminders")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmail">Marketing and promotional emails</Label>
                    <Switch 
                      id="marketingEmail" 
                      checked={emailSettings.marketing}
                      onCheckedChange={() => handleEmailSettingsChange("marketing")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Push Notifications
                </CardTitle>
                <CardDescription>Configure notifications within the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="courseUpdatesPush">Course updates</Label>
                    <Switch 
                      id="courseUpdatesPush" 
                      checked={pushSettings.courseUpdates}
                      onCheckedChange={() => handlePushSettingsChange("courseUpdates")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newMessagesPush">New messages and comments</Label>
                    <Switch 
                      id="newMessagesPush" 
                      checked={pushSettings.newMessages}
                      onCheckedChange={() => handlePushSettingsChange("newMessages")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assignmentsPush">Assignment deadlines</Label>
                    <Switch 
                      id="assignmentsPush" 
                      checked={pushSettings.assignments}
                      onCheckedChange={() => handlePushSettingsChange("assignments")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remindersPush">Class reminders</Label>
                    <Switch 
                      id="remindersPush" 
                      checked={pushSettings.reminders}
                      onCheckedChange={() => handlePushSettingsChange("reminders")}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={saveNotificationSettings}>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control who can see your information and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Profile Visibility</Label>
                  <p className="text-sm text-gray-500 mb-4">Choose who can view your profile</p>
                  <RadioGroup 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="everyone" id="everyone" />
                      <Label htmlFor="everyone">Everyone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enrolled" id="enrolled" />
                      <Label htmlFor="enrolled">Only enrolled students and instructors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Only instructors and administrators</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Learning Activity Visibility</Label>
                  <p className="text-sm text-gray-500 mb-4">Choose who can view your learning activity</p>
                  <RadioGroup 
                    value={privacySettings.activityVisibility} 
                    onValueChange={(value) => handlePrivacyChange("activityVisibility", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="everyone" id="activity-everyone" />
                      <Label htmlFor="activity-everyone">Everyone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enrolled" id="activity-enrolled" />
                      <Label htmlFor="activity-enrolled">Only enrolled students and instructors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="activity-private" />
                      <Label htmlFor="activity-private">Private (Only you)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Online Status</Label>
                    <p className="text-sm text-gray-500">Allow others to see when you're online</p>
                  </div>
                  <Switch 
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                  />
                </div>
                
                <div className="mt-6">
                  <Button onClick={savePrivacySettings}>Save Privacy Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Laptop className="h-5 w-5 mr-2" />
                Accessibility Settings
              </CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Reduce Motion</Label>
                    <p className="text-sm text-gray-500">Minimize animations throughout the platform</p>
                  </div>
                  <Switch 
                    checked={accessibilitySettings.reduceMotion}
                    onCheckedChange={() => handleAccessibilityChange("reduceMotion")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">High Contrast Mode</Label>
                    <p className="text-sm text-gray-500">Increase contrast for better readability</p>
                  </div>
                  <Switch 
                    checked={accessibilitySettings.contrastMode}
                    onCheckedChange={() => handleAccessibilityChange("contrastMode")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Larger Text</Label>
                    <p className="text-sm text-gray-500">Increase text size throughout the platform</p>
                  </div>
                  <Switch 
                    checked={accessibilitySettings.largerText}
                    onCheckedChange={() => handleAccessibilityChange("largerText")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Autoplay Videos</Label>
                    <p className="text-sm text-gray-500">Allow videos to play automatically</p>
                  </div>
                  <Switch 
                    checked={accessibilitySettings.autoplay}
                    onCheckedChange={() => handleAccessibilityChange("autoplay")}
                  />
                </div>
                
                <div className="mt-6">
                  <Button onClick={saveAccessibilitySettings}>Save Accessibility Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                Language & Localization
              </CardTitle>
              <CardDescription>Set your preferred language and regional settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Interface Language</Label>
                  <p className="text-sm text-gray-500 mb-3">Choose the language for menus and interface</p>
                  <Select value={languageSettings.interface} onValueChange={(value) => setLanguageSettings({...languageSettings, interface: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Content Language</Label>
                  <p className="text-sm text-gray-500 mb-3">Preferred language for course content</p>
                  <Select value={languageSettings.content} onValueChange={(value) => setLanguageSettings({...languageSettings, content: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Timezone</Label>
                  <p className="text-sm text-gray-500 mb-3">Set your timezone for accurate scheduling</p>
                  <Select value={languageSettings.timezone} onValueChange={(value) => setLanguageSettings({...languageSettings, timezone: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <Button onClick={saveLanguageSettings}>Save Language Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your learning environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Theme Mode</Label>
                  <p className="text-sm text-gray-500 mb-4">Choose your preferred color scheme</p>
                  <RadioGroup value={themeSettings.mode} onValueChange={(value) => setThemeSettings({...themeSettings, mode: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System (Auto)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Accent Color</Label>
                  <p className="text-sm text-gray-500 mb-3">Choose your preferred accent color</p>
                  <Select value={themeSettings.accentColor} onValueChange={(value) => setThemeSettings({...themeSettings, accentColor: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Use less spacing for a more compact interface</p>
                  </div>
                  <Switch 
                    checked={themeSettings.compactMode}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, compactMode: checked})}
                  />
                </div>

                <div className="mt-6">
                  <Button onClick={saveThemeSettings}>Save Appearance Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Learning Preferences
              </CardTitle>
              <CardDescription>Customize your learning experience and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Default Playback Speed</Label>
                  <p className="text-sm text-gray-500 mb-3">Set your preferred video playback speed</p>
                  <Select value={learningSettings.defaultPlaybackSpeed} onValueChange={(value) => setLearningSettings({...learningSettings, defaultPlaybackSpeed: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5x">0.5x</SelectItem>
                      <SelectItem value="0.75x">0.75x</SelectItem>
                      <SelectItem value="1x">1x (Normal)</SelectItem>
                      <SelectItem value="1.25x">1.25x</SelectItem>
                      <SelectItem value="1.5x">1.5x</SelectItem>
                      <SelectItem value="2x">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-progress Lessons</Label>
                    <p className="text-sm text-gray-500">Automatically mark lessons as complete when finished</p>
                  </div>
                  <Switch 
                    checked={learningSettings.autoProgress}
                    onCheckedChange={(checked) => setLearningSettings({...learningSettings, autoProgress: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Bookmarks</Label>
                    <p className="text-sm text-gray-500">Allow saving bookmarks in video lessons</p>
                  </div>
                  <Switch 
                    checked={learningSettings.bookmarks}
                    onCheckedChange={(checked) => setLearningSettings({...learningSettings, bookmarks: checked})}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Download Quality</Label>
                  <p className="text-sm text-gray-500 mb-3">Choose quality for offline downloads</p>
                  <Select value={learningSettings.downloadQuality} onValueChange={(value) => setLearningSettings({...learningSettings, downloadQuality: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (360p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="high">High (1080p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <Button onClick={saveLearningSettings}>Save Learning Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data & Storage
              </CardTitle>
              <CardDescription>Manage your data and storage preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Analytics & Usage Data</Label>
                    <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                  </div>
                  <Switch 
                    checked={dataSettings.analytics}
                    onCheckedChange={(checked) => setDataSettings({...dataSettings, analytics: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Cookies & Tracking</Label>
                    <p className="text-sm text-gray-500">Allow cookies for personalized experience</p>
                  </div>
                  <Switch 
                    checked={dataSettings.cookies}
                    onCheckedChange={(checked) => setDataSettings({...dataSettings, cookies: checked})}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Data Retention</Label>
                  <p className="text-sm text-gray-500 mb-3">How long to keep your learning data</p>
                  <Select value={dataSettings.dataRetention} onValueChange={(value) => setDataSettings({...dataSettings, dataRetention: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <Button onClick={saveDataSettings}>Save Data Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Integration & Connected Apps
              </CardTitle>
              <CardDescription>Connect external services to enhance your learning experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Calendar Integration</Label>
                    <p className="text-sm text-gray-500">Sync course schedules with your calendar</p>
                  </div>
                  <Switch 
                    checked={integrationSettings.calendar}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, calendar: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Slack Notifications</Label>
                    <p className="text-sm text-gray-500">Receive course updates in Slack</p>
                  </div>
                  <Switch 
                    checked={integrationSettings.slack}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, slack: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">GitHub Integration</Label>
                    <p className="text-sm text-gray-500">Connect for coding assignments and projects</p>
                  </div>
                  <Switch 
                    checked={integrationSettings.github}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, github: checked})}
                  />
                </div>

                <div className="mt-6">
                  <Button onClick={saveIntegrationSettings}>Save Integration Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Backup & Export
              </CardTitle>
              <CardDescription>Manage your data backups and export options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Automatic Backup</Label>
                    <p className="text-sm text-gray-500">Automatically backup your learning progress</p>
                  </div>
                  <Switch 
                    checked={backupSettings.autoBackup}
                    onCheckedChange={(checked) => setBackupSettings({...backupSettings, autoBackup: checked})}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Backup Frequency</Label>
                  <p className="text-sm text-gray-500 mb-3">How often to create backups</p>
                  <Select value={backupSettings.frequency} onValueChange={(value) => setBackupSettings({...backupSettings, frequency: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Include Progress Data</Label>
                    <p className="text-sm text-gray-500">Include course progress in backups</p>
                  </div>
                  <Switch 
                    checked={backupSettings.includeProgress}
                    onCheckedChange={(checked) => setBackupSettings({...backupSettings, includeProgress: checked})}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Download your data in various formats</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => toast({title: "Export started", description: "Your data export will be ready shortly."})}>
                      Export Progress (JSON)
                    </Button>
                    <Button variant="outline" onClick={() => toast({title: "Export started", description: "Your certificates will be ready shortly."})}>
                      Export Certificates (PDF)
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={saveBackupSettings}>Save Backup Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => toast({
                      title: "Coming Soon",
                      description: "Two-factor authentication will be available in a future update.",
                    })}
                  >
                    Enable 2FA
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-1">Linked Accounts</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your accounts for easier login
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                              queryParams: {
                                access_type: 'offline',
                                prompt: 'consent',
                              },
                            }
                          });
                          if (error) throw error;
                        } catch (error: any) {
                          toast({
                            title: "Link Failed",
                            description: error.message || "Could not link Google account",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Link Google Account
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'github'
                          });
                          if (error) throw error;
                        } catch (error: any) {
                          toast({
                            title: "Link Failed", 
                            description: error.message || "Could not link GitHub account",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Link GitHub Account
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-red-600 mb-1">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                   <div className="flex flex-col gap-3">
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                           <Trash2 className="h-4 w-4 mr-2" />
                           Delete Account
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Delete Account</AlertDialogTitle>
                           <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                             Delete Account
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="outline">
                           <LogOut className="h-4 w-4 mr-2" />
                           Log Out of All Devices
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Log Out of All Devices</AlertDialogTitle>
                           <AlertDialogDescription>
                             This will sign you out of all devices. You'll need to log in again on each device.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleLogoutAllDevices}>
                             Log Out All Devices
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
