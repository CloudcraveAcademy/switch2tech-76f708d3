
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Settings, Server, Database, Cpu, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SystemPage = () => {
  const [activeTab, setActiveTab] = useState("status");
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Mock system status data
  const systemStatus = {
    serverStatus: "operational",
    databaseStatus: "operational",
    storageStatus: "operational",
    apiStatus: "operational",
    lastChecked: new Date().toISOString(),
    serverLoad: 32,
    memoryUsage: 45,
    diskUsage: 68,
  };

  // Mock email settings
  const [emailSettings, setEmailSettings] = useState({
    sendWelcomeEmail: true,
    sendCourseEnrollment: true,
    sendCourseCompletion: true,
    sendPaymentReceipt: true,
    senderName: "Switch to Tech",
    senderEmail: "no-reply@switch2tech.com",
    smtpServer: "smtp.example.com",
    smtpPort: "587",
  });

  // Mock site settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Switch to Tech",
    siteDescription: "Learn tech skills and switch careers",
    allowRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    defaultUserRole: "student",
    defaultCurrency: "NGN",
    timezone: "Africa/Lagos",
  });

  const handleRefreshStatus = () => {
    setIsPerformingAction(true);
    toast({
      title: "Refreshing system status",
      description: "Checking all system components...",
    });

    // Simulate API call
    setTimeout(() => {
      setIsPerformingAction(false);
      toast({
        title: "System status refreshed",
        description: "All systems are operational.",
      });
    }, 2000);
  };

  const handleRunMaintenance = () => {
    if (!confirm("Are you sure you want to run system maintenance? This may temporarily affect system performance.")) {
      return;
    }

    setIsPerformingAction(true);
    toast({
      title: "Maintenance started",
      description: "Running system maintenance tasks...",
    });

    // Simulate API call
    setTimeout(() => {
      setIsPerformingAction(false);
      toast({
        title: "Maintenance completed",
        description: "System maintenance tasks have been successfully completed.",
      });
    }, 3000);
  };

  const handleClearCache = () => {
    if (!confirm("Are you sure you want to clear the system cache? This may temporarily slow down the system.")) {
      return;
    }

    setIsPerformingAction(true);
    toast({
      title: "Clearing cache",
      description: "Clearing system cache...",
    });

    // Simulate API call
    setTimeout(() => {
      setIsPerformingAction(false);
      toast({
        title: "Cache cleared",
        description: "System cache has been successfully cleared.",
      });
    }, 2000);
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Saving email settings",
      description: "Updating email configuration...",
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Email settings saved",
        description: "Your email settings have been successfully updated.",
      });
    }, 1000);
  };

  const handleSaveSiteSettings = () => {
    toast({
      title: "Saving site settings",
      description: "Updating site configuration...",
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Site settings saved",
        description: "Your site settings have been successfully updated.",
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Management</h1>
          <p className="text-gray-600">Monitor and manage platform system settings</p>
        </div>
        <div>
          <Button onClick={handleRefreshStatus} disabled={isPerformingAction}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        {/* System Status Tab */}
        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={systemStatus.serverStatus === "operational" ? "success" : "destructive"}>
                    {systemStatus.serverStatus === "operational" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {systemStatus.serverStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={systemStatus.databaseStatus === "operational" ? "success" : "destructive"}>
                    {systemStatus.databaseStatus === "operational" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {systemStatus.databaseStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={systemStatus.apiStatus === "operational" ? "success" : "destructive"}>
                    {systemStatus.apiStatus === "operational" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {systemStatus.apiStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Cpu className="mr-2 h-4 w-4" />
                  Storage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={systemStatus.storageStatus === "operational" ? "success" : "destructive"}>
                    {systemStatus.storageStatus === "operational" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {systemStatus.storageStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Server Load</CardTitle>
                <CardDescription>Current CPU usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{systemStatus.serverLoad}%</span>
                    <span className="text-sm text-gray-500">Low</span>
                  </div>
                  <Progress value={systemStatus.serverLoad} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Memory Usage</CardTitle>
                <CardDescription>RAM utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{systemStatus.memoryUsage}%</span>
                    <span className="text-sm text-gray-500">Normal</span>
                  </div>
                  <Progress value={systemStatus.memoryUsage} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Disk Usage</CardTitle>
                <CardDescription>Storage utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{systemStatus.diskUsage}%</span>
                    <span className="text-sm text-orange-500">High</span>
                  </div>
                  <Progress value={systemStatus.diskUsage} className="bg-orange-100" indicatorClassName="bg-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>Perform system maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Clear System Cache</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Clear temporary files and cached data to free up resources.
                  </p>
                  <Button variant="outline" onClick={handleClearCache} disabled={isPerformingAction}>
                    Clear Cache
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Run Database Optimization</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Optimize database tables, repair inconsistencies, and improve performance.
                  </p>
                  <Button variant="outline" onClick={handleRunMaintenance} disabled={isPerformingAction}>
                    Run Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Updates</CardTitle>
                <CardDescription>System version and update history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Current Version</h3>
                    <Badge>v2.5.3</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Released on May 12, 2023</p>
                </div>
                
                <h3 className="font-medium mb-4">Update History</h3>
                <div className="space-y-4">
                  {[
                    { version: "v2.5.3", date: "May 12, 2023", description: "Added improved reporting features and fixed student enrollment bugs" },
                    { version: "v2.5.2", date: "April 28, 2023", description: "Security updates and performance improvements" },
                  ].map((update, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{update.version}</h4>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-sm">{update.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Site Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>Manage general platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select 
                    value={siteSettings.defaultCurrency}
                    onValueChange={(value) => setSiteSettings({...siteSettings, defaultCurrency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select 
                    value={siteSettings.timezone}
                    onValueChange={(value) => setSiteSettings({...siteSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultUserRole">Default User Role</Label>
                  <Select 
                    value={siteSettings.defaultUserRole}
                    onValueChange={(value) => setSiteSettings({...siteSettings, defaultUserRole: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Security & Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowRegistration"
                      checked={siteSettings.allowRegistration}
                      onCheckedChange={(checked) => setSiteSettings({...siteSettings, allowRegistration: checked})}
                    />
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireEmailVerification"
                      checked={siteSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSiteSettings({...siteSettings, requireEmailVerification: checked})}
                    />
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Maintenance</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={siteSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSiteSettings({...siteSettings, maintenanceMode: checked})}
                  />
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">When enabled, only administrators can access the site.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSiteSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Manage email settings and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendWelcomeEmail"
                      checked={emailSettings.sendWelcomeEmail}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendWelcomeEmail: checked})}
                    />
                    <Label htmlFor="sendWelcomeEmail">Welcome Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendCourseEnrollment"
                      checked={emailSettings.sendCourseEnrollment}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendCourseEnrollment: checked})}
                    />
                    <Label htmlFor="sendCourseEnrollment">Course Enrollment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendCourseCompletion"
                      checked={emailSettings.sendCourseCompletion}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendCourseCompletion: checked})}
                    />
                    <Label htmlFor="sendCourseCompletion">Course Completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendPaymentReceipt"
                      checked={emailSettings.sendPaymentReceipt}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendPaymentReceipt: checked})}
                    />
                    <Label htmlFor="sendPaymentReceipt">Payment Receipts</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/email-templates/welcome">Edit Welcome Email</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/email-templates/enrollment">Edit Enrollment Email</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/email-templates/completion">Edit Completion Email</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/email-templates/receipt">Edit Payment Receipt</a>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmailSettings}>Save Email Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Similar structure for Backup and Logs tabs */}
      </Tabs>
    </div>
  );
};

// Define a custom Badge variant for success
const Input = ({ className, ...props }) => {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default SystemPage;
