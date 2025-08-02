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
  Laptop,
  Trash2,
  LogOut,
  Palette
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

  const [themeSettings, setThemeSettings] = useState({
    mode: "system",
    accentColor: "blue",
    compactMode: false,
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

      // Load theme settings
      if (prefs.themeSettings) {
        setThemeSettings({ ...themeSettings, ...prefs.themeSettings });
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

  const handleThemeChange = (setting: keyof typeof themeSettings, value: any) => {
    setThemeSettings({
      ...themeSettings,
      [setting]: value,
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

  const saveAppearanceSettings = async () => {
    try {
      const currentPrefs = profileData?.preferences || {};
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          themeSettings,
        }
      });
      toast({
        title: "Appearance settings updated",
        description: "Your appearance preferences have been saved successfully.",
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
      // Send deletion request email
      const { error } = await supabase.functions.invoke('send-account-deletion-email', {
        body: { userId: user?.id }
      });
      
      if (error) throw error;
      
      toast({
        title: "Deletion confirmation email sent",
        description: "Please check your email and click the confirmation link to permanently delete your account. The link expires in 24 hours.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Account deletion request failed:', error);
      toast({
        title: "Request failed",
        description: "We couldn't send the deletion confirmation email. Please try again or contact support.",
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
              value="appearance" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Palette className="h-4 w-4 mr-2" />
              Appearance
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

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose what email notifications you'd like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="courseUpdates">Course Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about course content updates and announcements.
                    </p>
                  </div>
                  <Switch
                    id="courseUpdates"
                    checked={emailSettings.courseUpdates}
                    onCheckedChange={() => handleEmailSettingsChange('courseUpdates')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignments">Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new assignments are available or due.
                    </p>
                  </div>
                  <Switch
                    id="assignments"
                    checked={emailSettings.assignments}
                    onCheckedChange={() => handleEmailSettingsChange('assignments')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="announcements">Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important announcements from instructors and administrators.
                    </p>
                  </div>
                  <Switch
                    id="announcements"
                    checked={emailSettings.announcements}
                    onCheckedChange={() => handleEmailSettingsChange('announcements')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminders">Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming deadlines and live sessions.
                    </p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={emailSettings.reminders}
                    onCheckedChange={() => handleEmailSettingsChange('reminders')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails about new courses and features.
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={emailSettings.marketing}
                    onCheckedChange={() => handleEmailSettingsChange('marketing')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Manage your browser and mobile push notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushCourseUpdates">Course Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications for course updates.
                    </p>
                  </div>
                  <Switch
                    id="pushCourseUpdates"
                    checked={pushSettings.courseUpdates}
                    onCheckedChange={() => handlePushSettingsChange('courseUpdates')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNewMessages">New Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages and replies.
                    </p>
                  </div>
                  <Switch
                    id="pushNewMessages"
                    checked={pushSettings.newMessages}
                    onCheckedChange={() => handlePushSettingsChange('newMessages')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushAssignments">Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about assignment deadlines and grades.
                    </p>
                  </div>
                  <Switch
                    id="pushAssignments"
                    checked={pushSettings.assignments}
                    onCheckedChange={() => handlePushSettingsChange('assignments')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushReminders">Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications for upcoming events.
                    </p>
                  </div>
                  <Switch
                    id="pushReminders"
                    checked={pushSettings.reminders}
                    onCheckedChange={() => handlePushSettingsChange('reminders')}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveNotificationSettings}>
                Save Notification Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Profile Visibility
                </CardTitle>
                <CardDescription>
                  Control who can see your profile and activity information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Who can see your profile?</Label>
                  <RadioGroup
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="everyone" id="profile-everyone" />
                      <Label htmlFor="profile-everyone">Everyone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enrolled" id="profile-enrolled" />
                      <Label htmlFor="profile-enrolled">Only students in same courses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="profile-private" />
                      <Label htmlFor="profile-private">Only me</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Who can see your course activity?</Label>
                  <RadioGroup
                    value={privacySettings.activityVisibility}
                    onValueChange={(value) => handlePrivacyChange('activityVisibility', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="everyone" id="activity-everyone" />
                      <Label htmlFor="activity-everyone">Everyone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enrolled" id="activity-enrolled" />
                      <Label htmlFor="activity-enrolled">Only students in same courses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="instructors" id="activity-instructors" />
                      <Label htmlFor="activity-instructors">Only instructors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="activity-private" />
                      <Label htmlFor="activity-private">Only me</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="onlineStatus">Show online status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're online and active.
                    </p>
                  </div>
                  <Switch
                    id="onlineStatus"
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={savePrivacySettings}>
                Save Privacy Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Accessibility Options
                </CardTitle>
                <CardDescription>
                  Customize your learning experience for better accessibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduceMotion">Reduce motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions for better focus.
                    </p>
                  </div>
                  <Switch
                    id="reduceMotion"
                    checked={accessibilitySettings.reduceMotion}
                    onCheckedChange={() => handleAccessibilityChange('reduceMotion')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contrastMode">High contrast mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase color contrast for better readability.
                    </p>
                  </div>
                  <Switch
                    id="contrastMode"
                    checked={accessibilitySettings.contrastMode}
                    onCheckedChange={() => handleAccessibilityChange('contrastMode')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="largerText">Larger text</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase font size throughout the interface.
                    </p>
                  </div>
                  <Switch
                    id="largerText"
                    checked={accessibilitySettings.largerText}
                    onCheckedChange={() => handleAccessibilityChange('largerText')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoplay">Auto-play videos</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically play course videos when loaded.
                    </p>
                  </div>
                  <Switch
                    id="autoplay"
                    checked={accessibilitySettings.autoplay}
                    onCheckedChange={() => handleAccessibilityChange('autoplay')}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveAccessibilitySettings}>
                Save Accessibility Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Theme & Display
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your learning environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme mode</Label>
                  <RadioGroup
                    value={themeSettings.mode}
                    onValueChange={(value) => handleThemeChange('mode', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system">System</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label htmlFor="accent-color">Accent color</Label>
                  <Select
                    value={themeSettings.accentColor}
                    onValueChange={(value) => handleThemeChange('accentColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accent color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactMode">Compact mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout to show more content.
                    </p>
                  </div>
                  <Switch
                    id="compactMode"
                    checked={themeSettings.compactMode}
                    onCheckedChange={(checked) => handleThemeChange('compactMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveAppearanceSettings}>
                Save Appearance Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Shield className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Logout from all devices</h4>
                    <p className="text-sm text-muted-foreground">
                      This will sign you out from all active sessions.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogoutAllDevices}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout All
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers, including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile and personal information</li>
                            <li>Course progress and certificates</li>
                            <li>Enrolled courses and payment history</li>
                            <li>All messages and discussions</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;