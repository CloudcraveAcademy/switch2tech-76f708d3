
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  BookOpen, 
  CircleDollarSign, 
  FileText,
  Bell,
  Mail,
  Settings,
  MessageSquare
} from "lucide-react";

const AdminQuickActions = () => {
  // Fetch pending courses count
  const { data: pendingCoursesCount = 0 } = useQuery({
    queryKey: ['admin-pending-courses-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false);
      return count || 0;
    }
  });

  // Fetch open support tickets count
  const { data: openTicketsCount = 0 } = useQuery({
    queryKey: ['admin-open-tickets-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      return count || 0;
    }
  });

  // Fetch pending payouts count
  const { data: pendingPayoutsCount = 0 } = useQuery({
    queryKey: ['admin-pending-payouts-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('instructor_payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    }
  });

  // Fetch pending instructor verifications count
  const { data: pendingVerificationsCount = 0 } = useQuery({
    queryKey: ['admin-pending-verifications-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'instructor')
        .eq('bank_verification_status', 'pending')
        .not('bank_name', 'is', null)
        .not('account_number', 'is', null);
      return count || 0;
    }
  });
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Manage Users
            </CardTitle>
            <CardDescription>
              Manage user accounts and access
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/users">
              <Button variant="default" size="sm" className="w-full">
                View All Users
              </Button>
            </Link>
            <Link to="/dashboard/users/create">
              <Button variant="outline" size="sm" className="w-full">
                Add New User
              </Button>
            </Link>
            <Link to="/dashboard/users/verification">
              <Button variant="outline" size="sm" className="w-full">
                Verification Queue
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Course Management */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course Management
            </CardTitle>
            <CardDescription>
              Manage and review courses
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/courses">
              <Button variant="default" size="sm" className="w-full">
                All Courses
              </Button>
            </Link>
            <Link to="/dashboard/course-approvals">
              <Button variant="outline" size="sm" className="w-full">
                Review Pending ({pendingCoursesCount})
              </Button>
            </Link>
            <Link to="/dashboard/categories">
              <Button variant="outline" size="sm" className="w-full">
                Manage Categories
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Financial Management */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CircleDollarSign className="mr-2 h-5 w-5" />
              Financial Tools
            </CardTitle>
            <CardDescription>
              Manage finances and payments
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/transactions">
              <Button variant="default" size="sm" className="w-full">
                Recent Transactions
              </Button>
            </Link>
            <Link to="/dashboard/payouts">
              <Button variant="outline" size="sm" className="w-full">
                Instructor Payouts
              </Button>
            </Link>
            <Link to="/dashboard/reports/financial">
              <Button variant="outline" size="sm" className="w-full">
                Financial Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Communications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Communications
            </CardTitle>
            <CardDescription>
              Platform communications tools
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/announcements">
              <Button variant="default" size="sm" className="w-full">
                Send Announcement
              </Button>
            </Link>
            <Link to="/dashboard/support-tickets">
              <Button variant="outline" size="sm" className="w-full">
                Support Tickets ({openTicketsCount})
              </Button>
            </Link>
            <Link to="/dashboard/email-templates">
              <Button variant="outline" size="sm" className="w-full">
                Email Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Course Review Requests</p>
                    <p className="text-xs text-gray-500">{pendingCoursesCount} pending approvals</p>
                  </div>
                </div>
                <Link to="/dashboard/course-approvals">
                  <Button variant="ghost" size="sm">Review</Button>
                </Link>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Support Tickets</p>
                    <p className="text-xs text-gray-500">{openTicketsCount} open tickets</p>
                  </div>
                </div>
                <Link to="/dashboard/support-tickets">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <CircleDollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Instructor Payouts</p>
                    <p className="text-xs text-gray-500">{pendingPayoutsCount} pending payouts</p>
                  </div>
                </div>
                <Link to="/dashboard/payouts">
                  <Button variant="ghost" size="sm">Process</Button>
                </Link>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Instructor Verifications</p>
                    <p className="text-xs text-gray-500">{pendingVerificationsCount} pending verifications</p>
                  </div>
                </div>
                <Link to="/dashboard/users/verification">
                  <Button variant="ghost" size="sm">Verify</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>Latest platform reports</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Monthly Financial Summary</p>
                  <p className="text-xs text-gray-500">Generated on May 1, 2023</p>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">User Growth Report</p>
                  <p className="text-xs text-gray-500">Generated on May 1, 2023</p>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Course Completion Analysis</p>
                  <p className="text-xs text-gray-500">Generated on April 28, 2023</p>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
              <div className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Instructor Performance</p>
                  <p className="text-xs text-gray-500">Generated on April 25, 2023</p>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
            <div className="p-3 border-t text-center">
              <Link to="/dashboard/reports" className="text-sm text-blue-600 hover:underline">
                View all reports
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuickActions;
