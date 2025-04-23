
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  BookOpen, 
  CircleDollarSign, 
  Users 
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome {user?.name}, here's an overview of the platform.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Courses
                </p>
                <p className="text-3xl font-bold">124</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>
                <p className="text-3xl font-bold">2,845</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">₦12.4M</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Completion
                </p>
                <p className="text-3xl font-bold">78%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Button variant="outline">View All</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Event</th>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">New Course Created</p>
                        <p className="text-xs text-gray-500">
                          "Advanced React Patterns"
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=instructor1"
                          alt="Instructor"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium">John Smith</p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">Today, 10:30 AM</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                        Pending Review
                      </span>
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">New User Registration</p>
                        <p className="text-xs text-gray-500">
                          Student account created
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=student42"
                          alt="Student"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium">Amina Mohammed</p>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">Today, 9:15 AM</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                        Completed
                      </span>
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">New Payment Received</p>
                        <p className="text-xs text-gray-500">
                          ₦45,000 - "DevOps for Beginners"
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=student24"
                          alt="Student"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium">David Okonkwo</p>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">Yesterday, 2:45 PM</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                        Successful
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">Course Update</p>
                        <p className="text-xs text-gray-500">
                          "Web Security Fundamentals" - Added new module
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=instructor8"
                          alt="Instructor"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">Yesterday, 11:20 AM</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                        Published
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add, edit, or remove users from the platform. Manage roles and permissions.
              </p>
              <Link to="/dashboard/users">
                <Button variant="outline" className="w-full">
                  Go to Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Course Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Review and approve submitted courses. 3 courses pending review.
              </p>
              <Link to="/dashboard/course-approvals">
                <Button variant="outline" className="w-full">
                  Review Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View financial reports, manage payouts, and track platform revenue.
              </p>
              <Link to="/dashboard/reports/financial">
                <Button variant="outline" className="w-full">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Server Status</p>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Operational</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Database Status</p>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Operational</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Storage Usage</p>
                <div className="flex items-center">
                  <span className="font-medium">65% (650GB/1TB)</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">API Status</p>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Operational</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Last Backup</p>
                <div className="flex items-center">
                  <span className="font-medium">Today, 03:00 AM</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Version</p>
                <div className="flex items-center">
                  <span className="font-medium">v2.5.3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
