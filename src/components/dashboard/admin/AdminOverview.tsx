
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  CircleDollarSign, 
  BarChart3, 
  CheckCircle,
  Activity
} from "lucide-react";

interface AdminOverviewProps {
  periodFilter: 'day' | 'week' | 'month' | 'year';
}

const AdminOverview = ({ periodFilter }: AdminOverviewProps) => {
  // In a real implementation, this data would come from an API call using the periodFilter
  // Here we're just simulating different data based on the filter
  const getStats = () => {
    switch (periodFilter) {
      case 'day':
        return {
          totalUsers: 85,
          newUsers: 12,
          totalCourses: 124,
          newCourses: 1,
          revenue: '₦180K',
          revenueTrend: 5,
          completionRate: 76,
          completionTrend: 2,
          totalEnrollments: 28,
          enrollmentsTrend: 8
        };
      case 'month':
        return {
          totalUsers: 2845,
          newUsers: 310,
          totalCourses: 124,
          newCourses: 15,
          revenue: '₦1.2M',
          revenueTrend: 12,
          completionRate: 78,
          completionTrend: 3,
          totalEnrollments: 820,
          enrollmentsTrend: 15
        };
      case 'year':
        return {
          totalUsers: 2845,
          newUsers: 1450,
          totalCourses: 124,
          newCourses: 82,
          revenue: '₦12.4M',
          revenueTrend: 32,
          completionRate: 78,
          completionTrend: 8,
          totalEnrollments: 7800,
          enrollmentsTrend: 25
        };
      default: // week
        return {
          totalUsers: 2845,
          newUsers: 65,
          totalCourses: 124,
          newCourses: 3,
          revenue: '₦320K',
          revenueTrend: 8,
          completionRate: 78,
          completionTrend: 0,
          totalEnrollments: 180,
          enrollmentsTrend: 12
        };
    }
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{stats.newUsers} new</span> in this {periodFilter}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Courses
              </p>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{stats.newCourses} new</span> in this {periodFilter}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Revenue
              </p>
              <p className="text-3xl font-bold">{stats.revenue}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{stats.revenueTrend}%</span> from previous {periodFilter}
              </p>
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
              <p className="text-3xl font-bold">{stats.completionRate}%</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{stats.completionTrend}%</span> from previous {periodFilter}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Enrollments
              </p>
              <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{stats.enrollmentsTrend}%</span> from previous {periodFilter}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed Courses
              </p>
              <p className="text-3xl font-bold">468</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+12</span> in this {periodFilter}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
