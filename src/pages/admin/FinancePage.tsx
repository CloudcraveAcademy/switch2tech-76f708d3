
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { CircleDollarSign, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");

  // Mock data for revenue overview
  const revenueData = [
    { name: 'Jan', revenue: 5000 },
    { name: 'Feb', revenue: 7000 },
    { name: 'Mar', revenue: 8500 },
    { name: 'Apr', revenue: 9800 },
    { name: 'May', revenue: 11000 },
    { name: 'Jun', revenue: 10500 },
    { name: 'Jul', revenue: 12500 },
    { name: 'Aug', revenue: 14000 },
    { name: 'Sep', revenue: 15500 },
    { name: 'Oct', revenue: 16800 },
    { name: 'Nov', revenue: 18000 },
    { name: 'Dec', revenue: 19500 },
  ];

  // Mock data for courses by revenue
  const courseRevenueData = [
    { name: 'Web Development', revenue: 25000 },
    { name: 'UI/UX Design', revenue: 18000 },
    { name: 'Data Science', revenue: 15000 },
    { name: 'Mobile App Dev', revenue: 12000 },
    { name: 'Cloud Computing', revenue: 10000 },
  ];

  // Fetch payment transactions
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          created_at,
          status,
          payment_method,
          user_id,
          course_id,
          courses:course_id (title),
          user_profiles:user_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      return data || [];
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Finance</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage revenue and transactions</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold">₦1,245,890</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      12% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Monthly Revenue
                    </p>
                    <p className="text-3xl font-bold">₦245,890</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      8% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Active Subscriptions
                    </p>
                    <p className="text-3xl font-bold">324</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      4% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Refund Rate
                    </p>
                    <p className="text-3xl font-bold">1.2%</p>
                    <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center mt-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      0.3% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <ArrowDownRight className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Courses</CardTitle>
                <CardDescription>Courses generating the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseRevenueData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center mt-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input placeholder="Search transactions..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-gray-500">
                        <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-medium">Student</th>
                        <th className="text-left py-3 px-4 font-medium">Course</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-right py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments && payments.length > 0 ? (
                        payments.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4 text-sm">
                              <span className="font-mono">{payment.id.substring(0, 8)}...</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {payment.user_profiles?.first_name} {payment.user_profiles?.last_name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>{payment.courses?.title || "N/A"}</div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ₦{Number(payment.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                payment.status === "success" ? "bg-green-100 text-green-700" : 
                                payment.status === "pending" ? "bg-amber-100 text-amber-700" : 
                                "bg-red-100 text-red-700"
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Download and view financial reports</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2">Monthly Revenue Report</h3>
                  <p className="text-sm text-gray-500 mb-4">Summary of all revenue for the current month</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2">Quarterly Tax Report</h3>
                  <p className="text-sm text-gray-500 mb-4">Financial summary for tax purposes</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2">Annual Statement</h3>
                  <p className="text-sm text-gray-500 mb-4">Complete annual financial statement</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
