import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

const currencySymbols = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const InstructorPayouts = () => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('NGN');

  // Fetch commission percentage
  const { data: commissionData } = useQuery({
    queryKey: ['commission-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('commission_percentage')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch instructor revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['instructor-revenue', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get transactions for instructor's courses
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          courses!inner(instructor_id, title)
        `)
        .eq('courses.instructor_id', user.id)
        .eq('status', 'success');

      if (error) throw error;

      // Calculate totals
      const grossRevenue = transactions?.reduce((sum, transaction) => 
        sum + Number(transaction.amount), 0) || 0;

      const commissionPercentage = commissionData?.commission_percentage || 10;
      const commissionAmount = (grossRevenue * commissionPercentage) / 100;
      const netEarnings = grossRevenue - commissionAmount;

      return {
        grossRevenue,
        commissionAmount,
        netEarnings,
        commissionPercentage,
        transactionCount: transactions?.length || 0,
        transactions: transactions || []
      };
    },
    enabled: !!user?.id && !!commissionData
  });

  // Fetch payout history
  const { data: payoutHistory } = useQuery({
    queryKey: ['instructor-payouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('instructor_payouts')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const formatAmount = (amount: number) => {
    return `${currencySymbols[selectedCurrency]}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary' as const,
      processing: 'default' as const,
      paid: 'default' as const,
      cancelled: 'destructive' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (revenueLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Revenue & Payouts</h1>
        <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
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
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(revenueData?.grossRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total from {revenueData?.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(revenueData?.commissionAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.commissionPercentage || 0}% platform fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(revenueData?.netEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Your earnings after commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(revenueData?.netEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting next payout cycle
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Gross Revenue</span>
                  <span className="font-semibold">{formatAmount(revenueData?.grossRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Platform Commission ({revenueData?.commissionPercentage || 0}%)</span>
                  <span className="font-semibold">-{formatAmount(revenueData?.commissionAmount || 0)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold text-green-600">
                  <span>Net Earnings</span>
                  <span>{formatAmount(revenueData?.netEarnings || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData?.transactions?.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.courses?.title}</TableCell>
                      <TableCell>{formatAmount(transaction.amount)}</TableCell>
                      <TableCell className="text-red-600">
                        -{formatAmount((transaction.amount * (revenueData.commissionPercentage / 100)))}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatAmount(transaction.amount * (1 - revenueData.commissionPercentage / 100))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutHistory && payoutHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross Revenue</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutHistory.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatAmount(Number(payout.gross_revenue))}</TableCell>
                        <TableCell className="text-red-600">
                          -{formatAmount(Number(payout.commission_amount))}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {formatAmount(Number(payout.net_payout))}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payout history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorPayouts;