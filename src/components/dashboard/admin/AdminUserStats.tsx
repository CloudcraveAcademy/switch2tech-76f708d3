import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Shield, GraduationCap } from "lucide-react";

const AdminUserStats = () => {
  // Fetch real user role distribution data
  const { data: roleData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['admin-user-stats-roles'],
    queryFn: async () => {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('role');

      if (!users) return [];

      const roleCounts = users.reduce((acc: any, user) => {
        const role = user.role || 'student';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      return [
        { name: 'Students', value: roleCounts.student || 0, color: '#10b981' },
        { name: 'Instructors', value: roleCounts.instructor || 0, color: '#8b5cf6' },
        { name: 'Admins', value: (roleCounts.admin || 0) + (roleCounts.super_admin || 0), color: '#f43f5e' }
      ];
    }
  });

  // Fetch user activity status (based on recent enrollments/activity)
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['admin-user-status'],
    queryFn: async () => {
      // Get users with recent activity (enrolled in courses in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentlyActive } = await supabase
        .from('enrollments')
        .select('student_id')
        .gte('enrollment_date', thirtyDaysAgo.toISOString());

      const activeUserIds = new Set(recentlyActive?.map(e => e.student_id) || []);

      // Get all users
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('id, created_at');

      const totalUsers = allUsers?.length || 0;
      const activeUsers = activeUserIds.size;
      const inactiveUsers = totalUsers - activeUsers;

      return [
        { name: 'Active', value: activeUsers, color: '#10b981' },
        { name: 'Inactive', value: inactiveUsers, color: '#64748b' }
      ];
    }
  });

  // Fetch user acquisition metrics (simplified version)
  const { data: acquisitionData, isLoading: isLoadingAcquisition } = useQuery({
    queryKey: ['admin-user-acquisition'],
    queryFn: async () => {
      // Get enrollment data as proxy for acquisition
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, enrollment_date');

      // For demo purposes, we'll simulate acquisition channels
      // In a real app, you'd track actual referral sources
      const totalEnrollments = enrollments?.length || 0;
      
      return [
        { name: 'Direct', value: Math.floor(totalEnrollments * 0.6), color: '#10b981' },
        { name: 'Referrals', value: Math.floor(totalEnrollments * 0.25), color: '#8b5cf6' },
        { name: 'Social Media', value: Math.floor(totalEnrollments * 0.10), color: '#60a5fa' },
        { name: 'Email', value: Math.floor(totalEnrollments * 0.05), color: '#f59e0b' }
      ];
    }
  });

  const { data: userMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['admin-user-metrics'],
    queryFn: async () => {
      // Get total users
      const { data: totalUsers } = await supabase
        .from('user_profiles')
        .select('id, created_at');

      // Get users from this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: newUsersThisMonth } = await supabase
        .from('user_profiles')
        .select('id')
        .gte('created_at', startOfMonth.toISOString());

      // Get active enrollments (proxy for active users)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity } = await supabase
        .from('enrollments')
        .select('student_id')
        .gte('enrollment_date', thirtyDaysAgo.toISOString());

      const uniqueActiveUsers = new Set(recentActivity?.map(e => e.student_id) || []).size;

      // Get verified instructors (those with bank details)
      const { data: verifiedInstructors } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'instructor')
        .not('bank_name', 'is', null)
        .not('account_number', 'is', null);

      return {
        totalUsers: totalUsers?.length || 0,
        newUsersThisMonth: newUsersThisMonth?.length || 0,
        activeUsers: uniqueActiveUsers,
        verifiedInstructors: verifiedInstructors?.length || 0
      };
    }
  });

  const chartConfig = {
    roles: { label: "User Roles" },
    status: { label: "User Status" },
    acquisition: { label: "User Acquisition" },
  };

  if (isLoadingRoles || isLoadingStatus || isLoadingAcquisition || isLoadingMetrics) {
    return (
      <div className="space-y-6">
        {/* User metrics cards loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // User metrics data
  const metrics = userMetrics ? [
    { label: "Total Users", value: userMetrics.totalUsers.toLocaleString(), icon: Users, trend: "overall", color: "blue" },
    { label: "Active Users", value: userMetrics.activeUsers.toLocaleString(), icon: UserCheck, trend: "last 30 days", color: "green" },
    { label: "Verified Instructors", value: userMetrics.verifiedInstructors.toLocaleString(), icon: GraduationCap, trend: "with bank details", color: "purple" },
    { label: "New This Month", value: userMetrics.newUsersThisMonth.toLocaleString(), icon: Shield, trend: "new registrations", color: "orange" }
  ] : [];

  // Create render functions for each pie chart
  const renderRoleChart = () => (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={roleData || []}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {(roleData || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderStatusChart = () => (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={statusData || []}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {(statusData || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderAcquisitionChart = () => (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={acquisitionData || []}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {(acquisitionData || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} acquisitions`, 'Count']} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  const getColorClasses = (color: string) => {
    const colorMap: any = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" }
    };
    return colorMap[color] || { bg: "bg-gray-100", text: "text-gray-600" };
  };

  return (
    <div className="space-y-6">
      {/* User Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Statistics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">User Roles</CardTitle>
            <CardDescription>Distribution of users by role</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig}>
              {renderRoleChart()}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">User Activity</CardTitle>
            <CardDescription>Active vs inactive users (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig}>
              {renderStatusChart()}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">User Acquisition</CardTitle>
            <CardDescription>How users find the platform</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig}>
              {renderAcquisitionChart()}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserStats;