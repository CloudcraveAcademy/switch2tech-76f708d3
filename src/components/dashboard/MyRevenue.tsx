
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Loader2, Globe } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertFromUSD, Currency } from "@/utils/currencyConverter";

// Define interfaces for the data structures
interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number[];
  revenueByMonth: { name: string; revenue: number }[];
  recentTransactions: Transaction[];
  revenueBySource: { name: string; value: number }[];
  totalTransactions: number;
}

interface Transaction {
  id: string;
  student_name: string;
  course_name: string;
  amount: number;
  date: string;
  payment_method: string;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENCIES = {
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' }
};

const MyRevenue = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"7days" | "30days" | "90days" | "year" | "all">("all");
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>('USD');

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "all":
        startDate.setFullYear(2020); // Set to a very early date to get all transactions
        break;
    }
    
    return { startDate, endDate };
  };

  // Fetch revenue data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["instructor-revenue", user?.id, period],
    queryFn: async (): Promise<RevenueData> => {
      if (!user?.id) {
        return {
          totalRevenue: 0,
          monthlyRevenue: [],
          revenueByMonth: [],
          recentTransactions: [],
          revenueBySource: [],
          totalTransactions: 0,
        };
      }

      const { startDate, endDate } = getDateRange();
      
      // Get instructor's courses with pricing information
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, price, discounted_price")
        .eq("instructor_id", user.id);
        
      if (coursesError) throw coursesError;
      if (!courses?.length) {
        return {
          totalRevenue: 0,
          monthlyRevenue: [],
          revenueByMonth: [],
          recentTransactions: [],
          revenueBySource: [],
          totalTransactions: 0,
        };
      }
      
      const courseIds = courses.map(course => course.id);
      
      // Get payment transactions for the instructor's courses
      let query = supabase
        .from("payment_transactions")
        .select(`
          id, 
          amount, 
          created_at, 
          course_id, 
          payment_method,
          user_id,
          status
        `)
        .in("course_id", courseIds);
        
      // Only apply date filters if not "all" period
      if (period !== "all") {
        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
      
      const { data: transactions, error: transactionsError } = await query
        .eq("status", "completed")
        .order("created_at", { ascending: false });
        
      console.log("Revenue query filters:", {
        courseIds,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period
      });
      
      console.log("Raw query result:", transactions);
        
      if (transactionsError) {
        console.error("Transaction query error:", transactionsError);
        throw transactionsError;
      }
      
      console.log("Transactions found:", transactions?.length, transactions);
      
      // Create a map of courses for easy lookup
      const coursesMap = courses.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
      }, {} as Record<string, any>);
      
      // Fix transaction amounts - use course price if transaction amount is 0
      const fixedTransactions = transactions?.map(tx => {
        const course = coursesMap[tx.course_id];
        const actualAmount = Number(tx.amount) || Number(course?.discounted_price || course?.price || 0);
        return { ...tx, amount: actualAmount };
      }) || [];
      
      // Calculate total revenue with corrected amounts
      const totalRevenue = fixedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalTransactions = fixedTransactions.length;
      
      // Calculate revenue by month using corrected amounts
      const monthlyData = Array(12).fill(0);
      const revenueByMonth: { name: string; revenue: number }[] = [];
      
      // Group by month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      
      fixedTransactions.forEach(tx => {
        const txDate = new Date(tx.created_at);
        const monthIndex = txDate.getMonth();
        monthlyData[monthIndex] += tx.amount;
      });
      
      // Create the last 6 months of data for chart
      for (let i = 0; i < 6; i++) {
        const monthIndex = (currentMonth - i + 12) % 12;
        revenueByMonth.unshift({
          name: monthNames[monthIndex].substring(0, 3),
          revenue: monthlyData[monthIndex]
        });
      }
      
      // Get revenue by source (payment method) using corrected amounts
      const revenueBySource: { name: string; value: number }[] = [];
      const paymentMethods: Record<string, number> = {};
      
      fixedTransactions.forEach(tx => {
        const method = tx.payment_method || "Other";
        paymentMethods[method] = (paymentMethods[method] || 0) + tx.amount;
      });
      
      Object.entries(paymentMethods).forEach(([method, amount]) => {
        revenueBySource.push({ name: method, value: amount });
      });
      
      // Get student and course information for recent transactions using corrected amounts
      const recentTxs = fixedTransactions.slice(0, 10);
      
      // Fetch user profiles for the transactions
      const userIds = [...new Set(recentTxs.map(tx => tx.user_id))];
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
        
      // Create recent transactions with student and course names
      const recentTransactions: Transaction[] = recentTxs.map(tx => {
        const course = courses.find(c => c.id === tx.course_id);
        const profile = userProfiles?.find(p => p.id === tx.user_id);
        const studentName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
          : "Unknown Student";
          
        return {
          id: tx.id,
          student_name: studentName,
          course_name: course?.title || "Unknown Course",
          amount: tx.amount, // Now using corrected amount
          date: tx.created_at,
          payment_method: tx.payment_method || "Unknown"
        };
      });
      
      return {
        totalRevenue,
        monthlyRevenue: monthlyData,
        revenueByMonth,
        recentTransactions,
        revenueBySource,
        totalTransactions,
      };
    },
    enabled: !!user?.id,
  });

  // Calculate percentage change from previous period
  const calculateChange = () => {
    if (!revenueData?.monthlyRevenue) return 0;
    
    const currentMonth = new Date().getMonth();
    const previousMonth = (currentMonth + 11) % 12;
    
    if (revenueData.monthlyRevenue[previousMonth] === 0) return 100;
    
    const change = ((revenueData.monthlyRevenue[currentMonth] - revenueData.monthlyRevenue[previousMonth]) / revenueData.monthlyRevenue[previousMonth]) * 100;
    return Math.round(change);
  };

  const percentageChange = calculateChange();
  const isPositiveChange = percentageChange >= 0;

  // Format currency based on selected currency
  const formatCurrency = (amount: number) => {
    const currencyConfig = CURRENCIES[currency];
    
    // Convert from USD (base currency) to selected currency
    const convertedAmount = currency === 'NGN' ? convertFromUSD(amount, 'NGN' as any) : convertFromUSD(amount, currency as Currency);
    
    if (currency === 'NGN' as any) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(convertedAmount);
    }
    
    if (Intl.NumberFormat) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'NGN' ? 'USD' : currency, // Use USD for NGN since NGN isn't supported
        currencyDisplay: 'symbol'
      }).format(convertedAmount);
    }
    
    return `${currencyConfig.symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <CircleDollarSign className="mr-2" /> My Revenue
          </h1>
          <p className="text-gray-600">Track your earnings and transaction history</p>
        </div>
        
        <div className="flex gap-3">
          <div className="w-48">
            <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([code, config]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {config.symbol} {config.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-48">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(revenueData?.totalRevenue || 0)}
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
                  Monthly Change
                </p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">
                    {percentageChange}%
                  </p>
                  {isPositiveChange ? (
                    <ArrowUpRight className="ml-2 h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="ml-2 h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className={`h-12 w-12 rounded-full ${isPositiveChange ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                <TrendingUp className={`h-6 w-6 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Transaction
                </p>
                <p className="text-3xl font-bold">
                  {revenueData?.totalTransactions 
                    ? formatCurrency(Math.round(revenueData.totalRevenue / revenueData.totalTransactions))
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Transactions
                </p>
                <p className="text-3xl font-bold">
                  {revenueData?.totalTransactions || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue for the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {revenueData?.revenueByMonth.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData.revenueByMonth}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest {revenueData?.recentTransactions.length || 0} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData?.recentTransactions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.course_name}</TableCell>
                      <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Detailed list of all transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData?.recentTransactions.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.student_name}</TableCell>
                      <TableCell>{tx.course_name}</TableCell>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(tx.amount)}</TableCell>
                      <TableCell className="capitalize">{tx.payment_method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <CircleDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No transactions yet</h3>
              <p className="mt-1 text-gray-500">
                Transactions will appear here as students purchase your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyRevenue;
