import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  BookOpen, 
  CircleDollarSign, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Shield,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminOverview from "./admin/AdminOverview";
import AdminUserStats from "./admin/AdminUserStats";
import AdminRevenueChart from "./admin/AdminRevenueChart";
import AdminActivityFeed from "./admin/AdminActivityFeed";
import AdminQuickActions from "./admin/AdminQuickActions";
import AdminSystemStatus from "./admin/AdminSystemStatus";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');

  return (
    <div className="p-6 space-y-8">
      {/* Header with greeting and period selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome {user?.name}, here's an overview of the platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={periodFilter === 'day' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPeriodFilter('day')}
          >
            Today
          </Button>
          <Button 
            variant={periodFilter === 'week' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPeriodFilter('week')}
          >
            This Week
          </Button>
          <Button 
            variant={periodFilter === 'month' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPeriodFilter('month')}
          >
            This Month
          </Button>
          <Button 
            variant={periodFilter === 'year' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPeriodFilter('year')}
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="reports" className="hidden md:flex">Reports</TabsTrigger>
          <TabsTrigger value="system" className="hidden md:flex">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <AdminOverview periodFilter={periodFilter} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Platform revenue for {periodFilter === 'day' ? 'today' : periodFilter === 'week' ? 'this week' : periodFilter === 'month' ? 'this month' : 'this year'}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminRevenueChart periodFilter={periodFilter} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-y-auto p-0">
                <AdminActivityFeed limit={5} />
              </CardContent>
              <div className="px-6 py-2 border-t text-center">
                <Link to="/dashboard/activity" className="text-sm text-blue-600 hover:underline">
                  View all activity
                </Link>
              </div>
            </Card>
          </div>
          
          <AdminQuickActions />
        </TabsContent>

        {/* Users Tab Content */}
        <TabsContent value="users" className="space-y-6">
          <AdminUserStats />


          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">User Accounts</h3>
                <Link to="/dashboard/users">
                  <Button>Manage Users</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Role Management</h3>
                <Link to="/dashboard/roles">
                  <Button variant="outline">Manage Roles</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Verification Status</h3>
                <Link to="/dashboard/verifications">
                  <Button variant="outline">View Pending</Button>
                </Link>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium">User Reports</h3>
                <Link to="/dashboard/user-reports">
                  <Button variant="outline">View Reports</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab Content */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Courses</p>
                    <p className="text-3xl font-bold">124</p>
                    <p className="text-sm text-green-600 mt-1">+5 this month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Courses</p>
                    <p className="text-3xl font-bold">98</p>
                    <p className="text-sm text-green-600 mt-1">+3 this month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-sm text-orange-600 mt-1">Needs attention</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Review and manage platform courses</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">All Courses</h3>
                <Link to="/dashboard/courses">
                  <Button>Manage Courses</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Categories</h3>
                <Link to="/dashboard/categories">
                  <Button variant="outline">Manage Categories</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Pending Reviews</h3>
                <Link to="/dashboard/course-reviews">
                  <Button variant="outline">View Pending</Button>
                </Link>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium">Course Reports</h3>
                <Link to="/dashboard/course-reports">
                  <Button variant="outline">View Reports</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Most popular courses and categories</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <h3 className="font-medium mb-4">Top 5 Courses by Enrollment</h3>
                <div className="space-y-4">
                  {[
                    { title: "Advanced React Patterns", enrollments: 345, category: "Development" },
                    { title: "Data Science Fundamentals", enrollments: 312, category: "Data Science" },
                    { title: "Complete UX/UI Design", enrollments: 287, category: "Design" },
                    { title: "Mobile App Development", enrollments: 254, category: "Development" },
                    { title: "Digital Marketing Essentials", enrollments: 218, category: "Marketing" }
                  ].map((course, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{course.enrollments}</p>
                        <p className="text-xs text-gray-500">enrollments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab Content */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold">₦12.4M</p>
                    <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                    <p className="text-3xl font-bold">₦1.2M</p>
                    <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                    <p className="text-3xl font-bold">₦320K</p>
                    <p className="text-sm text-gray-500 mt-1">Due next week</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Management</CardTitle>
              <CardDescription>Track and manage platform finances</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Transaction History</h3>
                <Link to="/dashboard/transactions">
                  <Button>View Transactions</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Instructor Payouts</h3>
                <Link to="/dashboard/payouts">
                  <Button variant="outline">Manage Payouts</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Revenue Reports</h3>
                <Link to="/dashboard/revenue-reports">
                  <Button variant="outline">View Reports</Button>
                </Link>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium">Payment Settings</h3>
                <Link to="/dashboard/payment-settings">
                  <Button variant="outline">Configure</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 5 transactions on the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Student</th>
                      <th className="text-left py-3 px-4 font-semibold">Course</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "TRX-4582", student: "David Okonkwo", course: "DevOps for Beginners", amount: "₦45,000", date: "Today, 10:30 AM", status: "successful" },
                      { id: "TRX-4581", student: "Amina Mohammed", course: "Advanced React Patterns", amount: "₦55,000", date: "Today, 9:15 AM", status: "successful" },
                      { id: "TRX-4580", student: "John Smith", course: "UX Research Fundamentals", amount: "₦35,000", date: "Yesterday, 3:45 PM", status: "successful" },
                      { id: "TRX-4579", student: "Sarah Johnson", course: "Data Science Bootcamp", amount: "₦75,000", date: "Yesterday, 11:20 AM", status: "successful" },
                      { id: "TRX-4578", student: "Michael Ade", course: "Python for Beginners", amount: "₦30,000", date: "May 15, 2:30 PM", status: "successful" }
                    ].map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{transaction.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{transaction.student}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{transaction.course}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{transaction.amount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{transaction.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t text-center">
                <Link to="/dashboard/transactions" className="text-sm text-blue-600 hover:underline">
                  View all transactions
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab Content */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Access platform analytics and reports</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-medium">User Reports</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">User registrations, activity, and retention analytics</p>
                  <Link to="/dashboard/reports/users">
                    <Button variant="outline" size="sm">View Report</Button>
                  </Link>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center mr-3">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-medium">Course Reports</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Course popularity, engagement, and completion rates</p>
                  <Link to="/dashboard/reports/courses">
                    <Button variant="outline" size="sm">View Report</Button>
                  </Link>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center mr-3">
                      <CircleDollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Financial Reports</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Revenue, transactions, and payout analytics</p>
                  <Link to="/dashboard/reports/financial">
                    <Button variant="outline" size="sm">View Report</Button>
                  </Link>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-red-600" />
                    </div>
                    <h3 className="font-medium">System Reports</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Platform performance, errors, and usage statistics</p>
                  <Link to="/dashboard/reports/system">
                    <Button variant="outline" size="sm">View Report</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>Create custom reports for specific time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Export Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" id="users-export" className="mr-2" />
                      <label htmlFor="users-export">User Data</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="courses-export" className="mr-2" />
                      <label htmlFor="courses-export">Course Data</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="transactions-export" className="mr-2" />
                      <label htmlFor="transactions-export">Transaction Data</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="activities-export" className="mr-2" />
                      <label htmlFor="activities-export">Activity Logs</label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Date Range</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label htmlFor="start-date" className="text-sm">Start Date</label>
                        <input type="date" id="start-date" className="w-full border rounded p-2" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="end-date" className="text-sm">End Date</label>
                        <input type="date" id="end-date" className="w-full border rounded p-2" />
                      </div>
                    </div>
                    <Button className="w-full">Generate Report</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab Content */}
        <TabsContent value="system" className="space-y-6">
          <AdminSystemStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage platform settings and configurations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">General Settings</h3>
                <Link to="/dashboard/settings/general">
                  <Button variant="outline">Configure</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">Email Templates</h3>
                <Link to="/dashboard/settings/email">
                  <Button variant="outline">Manage Templates</Button>
                </Link>
              </div>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-medium">API Configuration</h3>
                <Link to="/dashboard/settings/api">
                  <Button variant="outline">Manage APIs</Button>
                </Link>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="font-medium">Backup & Restore</h3>
                <Link to="/dashboard/settings/backup">
                  <Button variant="outline">Manage Backups</Button>
                </Link>
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
                  { version: "v2.5.1", date: "April 15, 2023", description: "Fixed payment processing issues and updated UI components" },
                  { version: "v2.5.0", date: "April 1, 2023", description: "Major feature update: Added live class scheduling and integration with calendar apps" }
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
