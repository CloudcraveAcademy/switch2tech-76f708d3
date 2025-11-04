
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  CircleDollarSign, 
  BarChart3, 
  CheckCircle,
  Activity
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { convertFromUSD } from "@/utils/currencyConverter";

interface AdminOverviewProps {
  periodFilter: 'day' | 'week' | 'month' | 'year';
  currency?: 'NGN' | 'USD' | 'EUR' | 'GBP';
}

const AdminOverview = ({ periodFilter, currency = 'NGN' }: AdminOverviewProps) => {
  // Fetch real data from backend
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview', periodFilter],
    queryFn: async () => {
      const now = new Date();
      const startDate = new Date();
      
      // Calculate date range based on period filter
      switch (periodFilter) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch total users
      const { data: totalUsers } = await supabase
        .from('user_profiles')
        .select('id, created_at');

      // Fetch new users in period
      const { data: newUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .gte('created_at', startDate.toISOString());

      // Fetch total courses
      const { data: totalCourses } = await supabase
        .from('courses')
        .select('id, created_at');

      // Fetch new courses in period
      const { data: newCourses } = await supabase
        .from('courses')
        .select('id')
        .gte('created_at', startDate.toISOString());

      // Fetch revenue data
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('amount, created_at, course_id, courses:course_id(price)')
        .in('status', ['completed', 'successful'])
        .gte('created_at', startDate.toISOString());

      // Calculate revenue (use course price if transaction amount is 0)
      const revenue = transactions?.reduce((sum, tx) => {
        const amount = Number(tx.amount) || Number(tx.courses?.price) || 0;
        return sum + amount;
      }, 0) || 0;

      // Fetch enrollments data
      const { data: totalEnrollments } = await supabase
        .from('enrollments')
        .select('id, enrollment_date')
        .gte('enrollment_date', startDate.toISOString());

      // Fetch completed enrollments
      const { data: completedEnrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('completed', true);

      const totalEnrollmentsCount = totalEnrollments?.length || 0;
      const completedCount = completedEnrollments?.length || 0;
      const completionRate = totalEnrollmentsCount > 0 ? Math.round((completedCount / totalEnrollmentsCount) * 100) : 0;

      return {
        totalUsers: totalUsers?.length || 0,
        newUsers: newUsers?.length || 0,
        totalCourses: totalCourses?.length || 0,
        newCourses: newCourses?.length || 0,
        revenue: revenue,
        totalEnrollments: totalEnrollmentsCount,
        completionRate: completionRate,
        completedCourses: completedCount
      };
    }
  });

  const formatCurrency = (value: number) => {
    const currencySymbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
    const symbol = currencySymbols[currency];
    
    // Convert from USD (base currency) to selected currency
    const convertedValue = currency === 'USD' ? value : convertFromUSD(value, currency);
    
    if (convertedValue >= 1000000) {
      return `${symbol}${(convertedValue / 1000000).toFixed(1)}M`;
    } else if (convertedValue >= 1000) {
      return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
    }
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const data = stats || {
    totalUsers: 0,
    newUsers: 0,
    totalCourses: 0,
    newCourses: 0,
    revenue: 0,
    totalEnrollments: 0,
    completionRate: 0,
    completedCourses: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>
              <p className="text-2xl font-bold">{data.totalUsers}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{data.newUsers} new</span> in this {periodFilter}
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
              <p className="text-2xl font-bold">{data.totalCourses}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">+{data.newCourses} new</span> in this {periodFilter}
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
              <p className="text-2xl font-bold">{formatCurrency(data.revenue)}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">Current period</span> revenue
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
              <p className="text-2xl font-bold">{data.completionRate}%</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">Course completion</span> rate
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
              <p className="text-2xl font-bold">{data.totalEnrollments}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">New enrollments</span> in this {periodFilter}
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
              <p className="text-2xl font-bold">{data.completedCourses}</p>
              <p className="text-xs mt-1">
                <span className="text-green-600">Total completed</span> courses
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
