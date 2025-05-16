
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle,
  Database, 
  Server, 
  HardDrive,
  Shield
} from "lucide-react";

const AdminSystemStatus = () => {
  const systemComponents = [
    { name: "API Status", status: "operational", uptime: "99.98%" },
    { name: "Database Status", status: "operational", uptime: "99.99%" },
    { name: "Authentication Service", status: "operational", uptime: "99.97%" },
    { name: "Storage Service", status: "operational", uptime: "99.95%" },
    { name: "Payment Processing", status: "operational", uptime: "99.93%" },
    { name: "Email Service", status: "degraded", uptime: "98.52%" }
  ];

  const resourceUsage = [
    { name: "Database Storage", used: 65, total: "650GB/1TB", icon: <Database className="h-5 w-5" /> },
    { name: "File Storage", used: 42, total: "420GB/1TB", icon: <HardDrive className="h-5 w-5" /> },
    { name: "API Usage", used: 28, total: "28K/100K requests", icon: <Server className="h-5 w-5" /> },
    { name: "Security", status: "secured", lastScan: "Today, 03:00 AM", icon: <Shield className="h-5 w-5" /> }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemComponents.map((component, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{component.name}</p>
                  <p className="text-xs text-gray-500">Uptime: {component.uptime}</p>
                </div>
                <div className="flex items-center">
                  {component.status === "operational" ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  ) : component.status === "degraded" ? (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Degraded</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Down</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Last Incident</h3>
              <span className="text-sm text-gray-500">May 8, 2023</span>
            </div>
            <p className="text-sm">Email delivery delays (resolved in 45 minutes)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
          <CardDescription>System resources and usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resourceUsage.map((resource, index) => (
              resource.name !== "Security" ? (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-500">{resource.icon}</div>
                      <p className="font-medium">{resource.name}</p>
                    </div>
                    <span className="text-sm">{resource.total}</span>
                  </div>
                  <Progress value={resource.used} className="h-2" />
                </div>
              ) : (
                <div key={index} className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 text-green-600">{resource.icon}</div>
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-500">All systems secure</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">Secured</p>
                      <p className="text-xs text-gray-500">Last scan: {resource.lastScan}</p>
                    </div>
                  </div>
                </div>
              )
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">System Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Version</span>
                  <span>v2.5.3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Backup</span>
                  <span>Today, 03:00 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Environment</span>
                  <span>Production</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemStatus;
