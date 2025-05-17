
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  Server,
  HardDrive,
  Database,
  Settings,
  Lock,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SystemPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.example.com",
    port: "587",
    username: "notifications@example.com",
    password: "**********"
  });

  const [apiKeys, setApiKeys] = useState({
    paystackLive: "sk_live_*******************",
    paystackTest: "sk_test_******************",
    googleMaps: "AIza*********************",
    cloudinary: "cloudinary://**************"
  });

  // Mock system health data
  const systemHealth = [
    { name: "API Server", status: "operational", uptime: "99.99%" },
    { name: "Database", status: "operational", uptime: "99.95%" },
    { name: "Storage", status: "operational", uptime: "100%" },
    { name: "Authentication", status: "operational", uptime: "99.98%" },
    { name: "Payment Processing", status: "partial_outage", uptime: "98.5%" },
  ];
  
  // Mock logs data
  const recentLogs = [
    { 
      timestamp: "2025-05-17 08:15:23", 
      level: "info", 
      service: "auth", 
      message: "User authenticated successfully" 
    },
    { 
      timestamp: "2025-05-17 08:14:55", 
      level: "warning", 
      service: "payment", 
      message: "Payment gateway timeout, retrying..." 
    },
    { 
      timestamp: "2025-05-17 08:12:30", 
      level: "error", 
      service: "database", 
      message: "Connection pool exhausted" 
    },
    { 
      timestamp: "2025-05-17 08:10:15", 
      level: "info", 
      service: "storage", 
      message: "Backup completed successfully" 
    },
    { 
      timestamp: "2025-05-17 08:05:42", 
      level: "info", 
      service: "api", 
      message: "Rate limit increased for premium users" 
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSmtpChange = (e) => {
    setSmtpSettings({
      ...smtpSettings,
      [e.target.id]: e.target.value
    });
  };

  const handleApiKeyChange = (e) => {
    setApiKeys({
      ...apiKeys,
      [e.target.id]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Operational
          </span>
        );
      case "partial_outage":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Partial Outage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Major Outage
          </span>
        );
    }
  };

  const getLogLevelBadge = (level) => {
    switch (level) {
      case "info":
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">INFO</span>;
      case "warning":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900/30 dark:text-yellow-300">WARNING</span>;
      case "error":
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900/30 dark:text-red-300">ERROR</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{level.toUpperCase()}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">System</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and configure system settings</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="mt-4 sm:mt-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>CPU Usage</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Memory Usage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Disk Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Last updated: 1 minute ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections</span>
                    <span>23/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Queries/sec</span>
                    <span>156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span>45ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">SSL Certificate</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Valid
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SSL Expiry</span>
                    <span>87 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Firewall</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Blocked Attempts</span>
                    <span>243 today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current status of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead className="text-right">Last Incident</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemHealth.map((component) => (
                    <TableRow key={component.name}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{getStatusBadge(component.status)}</TableCell>
                      <TableCell>{component.uptime}</TableCell>
                      <TableCell className="text-right">
                        {component.status === "operational" ? "None" : "2 days ago"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for system emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input 
                      id="host" 
                      value={smtpSettings.host} 
                      onChange={handleSmtpChange}
                      className="max-w-md" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="port">SMTP Port</Label>
                    <Input 
                      id="port" 
                      value={smtpSettings.port} 
                      onChange={handleSmtpChange}
                      className="max-w-md" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">SMTP Username</Label>
                    <Input 
                      id="username" 
                      value={smtpSettings.username} 
                      onChange={handleSmtpChange}
                      className="max-w-md" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">SMTP Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={smtpSettings.password} 
                      onChange={handleSmtpChange}
                      className="max-w-md" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Email Templates</h3>
                          <p className="text-sm text-gray-500">Customize system email templates</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage Templates</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Notification Settings</h3>
                          <p className="text-sm text-gray-500">Configure system notification preferences</p>
                        </div>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="mr-2" variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paystackLive">Paystack Live Key</Label>
                  <Input 
                    id="paystackLive" 
                    value={apiKeys.paystackLive} 
                    onChange={handleApiKeyChange}
                    className="max-w-2xl" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paystackTest">Paystack Test Key</Label>
                  <Input 
                    id="paystackTest" 
                    value={apiKeys.paystackTest} 
                    onChange={handleApiKeyChange}
                    className="max-w-2xl" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleMaps">Google Maps API Key</Label>
                  <Input 
                    id="googleMaps" 
                    value={apiKeys.googleMaps} 
                    onChange={handleApiKeyChange}
                    className="max-w-2xl" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cloudinary">Cloudinary URL</Label>
                  <Input 
                    id="cloudinary" 
                    value={apiKeys.cloudinary} 
                    onChange={handleApiKeyChange}
                    className="max-w-2xl" 
                  />
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="mr-2" variant="outline">Cancel</Button>
                  <Button>Save Keys</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Review recent system activity</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0 flex">
                  <Button variant="outline" size="sm" className="mr-2">
                    <FileText className="h-4 w-4 mr-1" />
                    Export Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Log Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell>{getLogLevelBadge(log.level)}</TableCell>
                        <TableCell>{log.service}</TableCell>
                        <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 flex justify-center">
                <Button variant="outline">Load More</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Filters</CardTitle>
              <CardDescription>Narrow down logs by specific criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <select id="logLevel" className="w-full mt-1 p-2 border rounded">
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="service">Service</Label>
                  <select id="service" className="w-full mt-1 p-2 border rounded">
                    <option value="all">All Services</option>
                    <option value="api">API</option>
                    <option value="auth">Auth</option>
                    <option value="payment">Payment</option>
                    <option value="database">Database</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input id="dateFrom" type="date" />
                </div>
                
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input id="dateTo" type="date" />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <CardTitle>Database Backups</CardTitle>
                  <CardDescription>Manage system backup schedule and restoration</CardDescription>
                </div>
                <Button className="mt-4 sm:mt-0">
                  Create Backup Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backup Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">2025-05-17 00:00:00</TableCell>
                      <TableCell>2.3 GB</TableCell>
                      <TableCell>Automated</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Download</Button>
                        <Button variant="outline" size="sm">Restore</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2025-05-16 00:00:00</TableCell>
                      <TableCell>2.2 GB</TableCell>
                      <TableCell>Automated</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Download</Button>
                        <Button variant="outline" size="sm">Restore</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2025-05-15 00:00:00</TableCell>
                      <TableCell>2.1 GB</TableCell>
                      <TableCell>Automated</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Download</Button>
                        <Button variant="outline" size="sm">Restore</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>Configure automatic backup settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="schedule">
                  <AccordionTrigger>Backup Schedule</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="daily"
                          name="backupFrequency"
                          checked
                        />
                        <label htmlFor="daily" className="ml-2">Daily</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="weekly"
                          name="backupFrequency"
                        />
                        <label htmlFor="weekly" className="ml-2">Weekly</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="monthly"
                          name="backupFrequency"
                        />
                        <label htmlFor="monthly" className="ml-2">Monthly</label>
                      </div>
                      
                      <div>
                        <Label htmlFor="backupTime">Backup Time</Label>
                        <Input id="backupTime" type="time" value="00:00" className="mt-1 max-w-xs" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="storage">
                  <AccordionTrigger>Storage Options</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="localStorage"
                          checked
                        />
                        <label htmlFor="localStorage" className="ml-2">Local Storage</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="cloudStorage"
                          checked
                        />
                        <label htmlFor="cloudStorage" className="ml-2">Cloud Storage</label>
                      </div>
                      
                      <div>
                        <Label htmlFor="retentionDays">Retention Period (days)</Label>
                        <Input id="retentionDays" type="number" value="30" className="mt-1 max-w-xs" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="notification">
                  <AccordionTrigger>Notification Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotification"
                          checked
                        />
                        <label htmlFor="emailNotification" className="ml-2">Email Notifications</label>
                      </div>
                      
                      <div>
                        <Label htmlFor="notificationEmail">Notification Email</Label>
                        <Input id="notificationEmail" value="admin@example.com" className="mt-1 max-w-xs" />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="failureOnly"
                        />
                        <label htmlFor="failureOnly" className="ml-2">Only notify on failure</label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 flex justify-end">
                <Button className="mr-2" variant="outline">Cancel</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemPage;
