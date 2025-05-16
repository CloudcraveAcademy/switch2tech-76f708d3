
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminUserStats = () => {
  // User role distribution data
  const roleData = [
    { name: 'Students', value: 2156, color: '#10b981' },
    { name: 'Instructors', value: 124, color: '#8b5cf6' },
    { name: 'Admins', value: 12, color: '#f43f5e' }
  ];
  
  // User status data
  const statusData = [
    { name: 'Active', value: 1845, color: '#10b981' },
    { name: 'Inactive', value: 420, color: '#64748b' },
    { name: 'Suspended', value: 27, color: '#f43f5e' }
  ];
  
  // User acquisition data
  const acquisitionData = [
    { name: 'Organic', value: 1542, color: '#10b981' },
    { name: 'Referrals', value: 680, color: '#8b5cf6' },
    { name: 'Social Media', value: 425, color: '#60a5fa' },
    { name: 'Email', value: 198, color: '#f59e0b' }
  ];

  const chartConfig = {
    roles: { label: "User Roles" },
    status: { label: "User Status" },
    acquisition: { label: "User Acquisition" },
  };

  // Create render functions for each pie chart
  const renderRoleChart = () => (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={roleData}
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
          {roleData.map((entry, index) => (
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
          data={statusData}
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
          {statusData.map((entry, index) => (
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
          data={acquisitionData}
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
          {acquisitionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
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
          <CardTitle className="text-lg">User Status</CardTitle>
          <CardDescription>Distribution of users by status</CardDescription>
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
  );
};

export default AdminUserStats;
