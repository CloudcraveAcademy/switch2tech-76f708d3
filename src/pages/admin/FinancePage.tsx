
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { CircleDollarSign, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Download, Search, DollarSign, TrendingUp, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [currency, setCurrency] = useState("NGN");

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };

  const formatCurrency = (amount: number) => {
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${amount.toLocaleString()}`;
  };

  // Fetch revenue analytics data
  const { data: revenueStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminRevenueStats', dateRange],
    queryFn: async () => {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      // Get all payment transactions
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          created_at,
          status,
          course_id,
          courses:course_id (title)
        `)
        .in('status', ['completed', 'success'])
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate total revenue
      const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      
      // Calculate monthly revenue for current month
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = transactions?.filter(tx => 
        new Date(tx.created_at) >= currentMonthStart
      ).reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      // Calculate previous month revenue for comparison
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const { data: prevMonthTx } = await supabase
        .from('payment_transactions')
        .select('amount')
        .in('status', ['completed', 'success'])
        .gte('created_at', prevMonthStart.toISOString())
        .lte('created_at', prevMonthEnd.toISOString());
      
      const prevMonthRevenue = prevMonthTx?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const monthlyGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

      // Calculate revenue by month for chart
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthRevenue = transactions?.filter(tx => {
          const txDate = new Date(tx.created_at);
          return txDate >= monthDate && txDate < nextMonth;
        }).reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

        monthlyData.push({
          name: monthDate.toLocaleDateString('en', { month: 'short' }),
          revenue: monthRevenue
        });
      }

      // Calculate course revenue
      const courseRevenue = new Map();
      transactions?.forEach(tx => {
        if (tx.courses?.title) {
          const current = courseRevenue.get(tx.courses.title) || 0;
          courseRevenue.set(tx.courses.title, current + Number(tx.amount));
        }
      });

      const courseRevenueData = Array.from(courseRevenue.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get enrollments count for active subscriptions
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('completed', false);

      const activeSubscriptions = enrollments?.length || 0;

      return {
        totalRevenue,
        monthlyRevenue,
        monthlyGrowth,
        activeSubscriptions,
        revenueData: monthlyData,
        courseRevenueData,
        totalTransactions: transactions?.length || 0
      };
    },
  });

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
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">NGN (₦)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                    <p className="text-3xl font-bold">
                      {formatCurrency(revenueStats?.totalRevenue || 0)}
                    </p>
                    <p className={`text-sm flex items-center mt-1 ${
                      (revenueStats?.monthlyGrowth || 0) >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(revenueStats?.monthlyGrowth || 0) >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(revenueStats?.monthlyGrowth || 0).toFixed(1)}% from last month
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
                    <p className="text-3xl font-bold">
                      {formatCurrency(revenueStats?.monthlyRevenue || 0)}
                    </p>
                    <p className={`text-sm flex items-center mt-1 ${
                      (revenueStats?.monthlyGrowth || 0) >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(revenueStats?.monthlyGrowth || 0) >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(revenueStats?.monthlyGrowth || 0).toFixed(1)}% from last month
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
                    <p className="text-3xl font-bold">
                      {revenueStats?.activeSubscriptions?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Active enrollments
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
                    {isLoadingStats ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueStats?.revenueData || []}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
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
                    {isLoadingStats ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={revenueStats?.courseRevenueData || []}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                          <Legend />
                          <Bar dataKey="revenue" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
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
                              {formatCurrency(Number(payment.amount))}
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

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Payouts</CardTitle>
              <CardDescription>Manage instructor payouts and commission tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Pending Payouts</p>
                      <p className="text-xl font-bold">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Monthly Payouts</p>
                      <p className="text-xl font-bold">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Active Instructors</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="text-left py-3 px-4 font-medium">Instructor</th>
                      <th className="text-left py-3 px-4 font-medium">Course Revenue</th>
                      <th className="text-left py-3 px-4 font-medium">Commission</th>
                      <th className="text-left py-3 px-4 font-medium">Payout Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No payout data available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Track revenue patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueStats?.revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Credit/Debit Card</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bank Transfer</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other</span>
                    <span className="text-sm font-medium">3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">92%</p>
                  <p className="text-sm text-gray-500">Payment Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(45)}</p>
                  <p className="text-sm text-gray-500">Avg Transaction Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">1.2%</p>
                  <p className="text-sm text-gray-500">Chargeback Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">3.2 days</p>
                  <p className="text-sm text-gray-500">Avg Settlement Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and download detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Revenue Report</span>
                    <span className="text-xs text-gray-500">Monthly breakdown</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span>Growth Analytics</span>
                    <span className="text-xs text-gray-500">Quarterly trends</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <DollarSign className="h-6 w-6 mb-2" />
                    <span>Payout Summary</span>
                    <span className="text-xs text-gray-500">Instructor earnings</span>
                  </Button>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Custom Report Generator</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Type</label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue Report</SelectItem>
                          <SelectItem value="transactions">Transaction Report</SelectItem>
                          <SelectItem value="payouts">Payout Report</SelectItem>
                          <SelectItem value="tax">Tax Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Recent Reports</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">December 2024 Revenue Report</p>
                        <p className="text-sm text-gray-500">Generated on Dec 31, 2024</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Q4 2024 Analytics Report</p>
                        <p className="text-sm text-gray-500">Generated on Dec 30, 2024</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
