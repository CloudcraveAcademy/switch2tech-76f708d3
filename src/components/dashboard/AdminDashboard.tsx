import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Link, useNavigate } from "react-router-dom";
import AdminOverview from "./admin/AdminOverview";
import AdminUserStats from "./admin/AdminUserStats";
import AdminRevenueChart from "./admin/AdminRevenueChart";
import AdminActivityFeed from "./admin/AdminActivityFeed";
import AdminQuickActions from "./admin/AdminQuickActions";
import AdminSystemStatus from "./admin/AdminSystemStatus";
import { Badge } from "@/components/ui/badge";
import UsersPage from "@/pages/admin/UsersPage";
import SystemPage from "@/pages/admin/SystemPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import CoursesPage from "@/pages/admin/CoursesPage";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'EUR' | 'GBP'>('NGN');

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
        <div className="flex items-center space-x-4">
          <Select value={currency} onValueChange={(value: 'NGN' | 'USD' | 'EUR' | 'GBP') => setCurrency(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">₦ NGN</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
            </SelectContent>
          </Select>
          
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
          <AdminOverview periodFilter={periodFilter} currency={currency} />
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
                <AdminRevenueChart periodFilter={periodFilter} currency={currency} />
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
          <UsersPage />
        </TabsContent>

        {/* Courses Tab Content */}
        <TabsContent value="courses" className="space-y-6">
          <CoursesPage />
        </TabsContent>

        {/* Finance Tab Content */}
        <TabsContent value="finance" className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Financial Management</h3>
              <p className="text-gray-600 mb-6">Access detailed financial reports and analytics</p>
              <Button onClick={() => navigate('/dashboard/finance')}>
                Go to Finance Dashboard
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab Content */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
