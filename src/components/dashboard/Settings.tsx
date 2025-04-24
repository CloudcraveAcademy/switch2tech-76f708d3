
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
  LogOut
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  
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

  const saveSettings = () => {
    toast({
      title: "Settings updated",
      description: "Your settings have been updated successfully.",
    });
  };

  const deleteAccount = () => {
    // In a real app, we'd show a confirmation dialog first
    toast({
      title: "Account deletion requested",
      description: "Please check your email to confirm account deletion.",
      variant: "destructive",
    });
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
                  <Button onClick={saveSettings}>Save Notification Settings</Button>
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
                  <Button onClick={saveSettings}>Save Privacy Settings</Button>
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
                  <Button onClick={saveSettings}>Save Accessibility Settings</Button>
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
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-1">Linked Accounts</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your accounts for easier login
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline">Link Google Account</Button>
                    <Button variant="outline">Link GitHub Account</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-red-600 mb-1">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={deleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <Button variant="outline">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out of All Devices
                    </Button>
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
