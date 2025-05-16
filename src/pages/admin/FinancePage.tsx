
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, Download, FileText, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancePage = () => {
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['admin-transactions', periodFilter],
    queryFn: async () => {
      // Get date range based on period filter
      const now = new Date();
      let fromDate;
      
      switch(periodFilter) {
        case 'day':
          fromDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          fromDate = new Date(now.setDate(diff));
          fromDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          fromDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          user_profiles:user_id (first_name, last_name),
          courses:course_id (title)
        `)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Process data for chart
  const chartData = React.useMemo(() => {
    if (!transactions) return [];
    
    const groupedData: Record<string, number> = {};
    
    // Group by date based on periodFilter
    transactions.forEach(transaction => {
      let dateKey;
      const date = new Date(transaction.created_at);
      
      switch(periodFilter) {
        case 'day':
          dateKey = `${date.getHours()}:00`;
          break;
        case 'week':
          dateKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
          break;
        case 'month':
          dateKey = date.getDate().toString();
          break;
        case 'year':
          dateKey = date.toLocaleString('default', { month: 'short' });
          break;
      }
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = 0;
      }
      
      groupedData[dateKey] += Number(transaction.amount) || 0;
    });
    
    // Convert to chart data format
    return Object.entries(groupedData).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [transactions, periodFilter]);

  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <p>Loading financial data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <p className="text-red-500">Error loading financial data: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <p className="text-gray-600">
            Track and manage platform finances
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  For {periodFilter === 'day' ? 'today' : 
                       periodFilter === 'week' ? 'this week' : 
                       periodFilter === 'month' ? 'this month' : 'this year'}
                </p>
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
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-3xl font-bold">{transactions?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  For {periodFilter === 'day' ? 'today' : 
                       periodFilter === 'week' ? 'this week' : 
                       periodFilter === 'month' ? 'this month' : 'this year'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Sale</p>
                <p className="text-3xl font-bold">
                  ₦{transactions && transactions.length > 0 
                    ? Math.round(totalRevenue / transactions.length).toLocaleString() 
                    : '0'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Per transaction</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Platform revenue for {periodFilter === 'day' ? 'today' : 
                                periodFilter === 'week' ? 'this week' : 
                                periodFilter === 'month' ? 'this month' : 'this year'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="amount" name="Revenue" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Instructor Payouts</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                All financial transactions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {transactions?.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{transaction.payment_reference || transaction.id.substring(0, 8)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{transaction.user_profiles?.first_name} {transaction.user_profiles?.last_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{transaction.courses?.title || "N/A"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">₦{Number(transaction.amount).toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                            {transaction.status || "successful"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {transactions?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No transactions found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
