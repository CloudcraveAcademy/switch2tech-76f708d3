
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { convertFromUSD } from "@/utils/currencyConverter";

interface AdminRevenueChartProps {
  periodFilter: 'day' | 'week' | 'month' | 'year';
  currency?: 'NGN' | 'USD' | 'EUR' | 'GBP';
}

const AdminRevenueChart = ({ periodFilter, currency = 'NGN' }: AdminRevenueChartProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue-chart', periodFilter],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      let intervals: any[] = [];

      // Generate time intervals based on period
      if (periodFilter === 'day') {
        startDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < 24; i += 3) {
          intervals.push({
            name: `${i}:00`,
            start: new Date(startDate.getTime() + (i * 60 * 60 * 1000)),
            end: new Date(startDate.getTime() + ((i + 3) * 60 * 60 * 1000))
          });
        }
      } else if (periodFilter === 'week') {
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
          intervals.push({
            name: days[date.getDay()],
            start: date,
            end: new Date(date.getTime() + (24 * 60 * 60 * 1000))
          });
        }
      } else if (periodFilter === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        const weeksInMonth = 4;
        for (let i = 0; i < weeksInMonth; i++) {
          const weekStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
          intervals.push({
            name: `Week ${i + 1}`,
            start: weekStart,
            end: new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000))
          });
        }
      } else { // year
        startDate = new Date(now.getFullYear(), 0, 1);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
          intervals.push({
            name: months[i],
            start: new Date(now.getFullYear(), i, 1),
            end: new Date(now.getFullYear(), i + 1, 1)
          });
        }
      }

      // Fetch all transactions
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('amount, created_at, course_id, courses:course_id(price)')
        .in('status', ['completed', 'successful'])
        .gte('created_at', startDate.toISOString());

      // Group transactions by intervals
      const chartData = intervals.map(interval => {
        const intervalTransactions = transactions?.filter(tx => {
          const txDate = new Date(tx.created_at);
          return txDate >= interval.start && txDate < interval.end;
        }) || [];

        const revenue = intervalTransactions.reduce((sum, tx) => {
          const amount = Number(tx.amount) || Number(tx.courses?.price) || 0;
          return sum + amount;
        }, 0);

        // Calculate payout (70% of revenue for instructors)
        const payout = Math.round(revenue * 0.7);

        return {
          name: interval.name,
          revenue,
          payout
        };
      });

      return chartData;
    }
  });

  const chartData = useMemo(() => {
    if (data) return data;
    // Fallback mock data if no real data available
    if (periodFilter === 'day') {
      return [
        { name: '0:00', revenue: 0, payout: 0 },
        { name: '3:00', revenue: 0, payout: 0 },
        { name: '6:00', revenue: 0, payout: 0 },
        { name: '9:00', revenue: 0, payout: 0 },
        { name: '12:00', revenue: 0, payout: 0 },
        { name: '15:00', revenue: 0, payout: 0 },
        { name: '18:00', revenue: 0, payout: 0 },
        { name: '21:00', revenue: 0, payout: 0 },
      ];
    } 
    else if (periodFilter === 'week') {
      return [
        { name: 'Sun', revenue: 0, payout: 0 },
        { name: 'Mon', revenue: 0, payout: 0 },
        { name: 'Tue', revenue: 0, payout: 0 },
        { name: 'Wed', revenue: 0, payout: 0 },
        { name: 'Thu', revenue: 0, payout: 0 },
        { name: 'Fri', revenue: 0, payout: 0 },
        { name: 'Sat', revenue: 0, payout: 0 },
      ];
    }
    else if (periodFilter === 'month') {
      return [
        { name: 'Week 1', revenue: 0, payout: 0 },
        { name: 'Week 2', revenue: 0, payout: 0 },
        { name: 'Week 3', revenue: 0, payout: 0 },
        { name: 'Week 4', revenue: 0, payout: 0 },
      ];
    }
    else { // year
      return [
        { name: 'Jan', revenue: 0, payout: 0 },
        { name: 'Feb', revenue: 0, payout: 0 },
        { name: 'Mar', revenue: 0, payout: 0 },
        { name: 'Apr', revenue: 0, payout: 0 },
        { name: 'May', revenue: 0, payout: 0 },
        { name: 'Jun', revenue: 0, payout: 0 },
        { name: 'Jul', revenue: 0, payout: 0 },
        { name: 'Aug', revenue: 0, payout: 0 },
        { name: 'Sep', revenue: 0, payout: 0 },
        { name: 'Oct', revenue: 0, payout: 0 },
        { name: 'Nov', revenue: 0, payout: 0 },
        { name: 'Dec', revenue: 0, payout: 0 },
      ];
    }
  }, [data, periodFilter]);

  // Format currency for display
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
    return `${symbol}${convertedValue}`;
  };

  const chartConfig = {
    revenue: { 
      label: "Revenue", 
      theme: { light: "#8b5cf6", dark: "#9f7aea" } 
    },
    payout: { 
      label: "Instructor Payouts", 
      theme: { light: "#60a5fa", dark: "#93c5fd" } 
    }
  };

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              padding={{ left: 20, right: 20 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tickFormatter={formatCurrency} 
              padding={{ top: 20, bottom: 0 }} 
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent 
                      indicator="line" 
                      nameKey="name"
                      formatter={(value, name) => {
                        return (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-[0.7rem] capitalize">{name}</span>
                            <span className="font-semibold">{formatCurrency(value as number)}</span>
                          </div>
                        );
                      }}
                    />
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="revenue"
            />
            <Area 
              type="monotone" 
              dataKey="payout" 
              stroke="#60a5fa" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorPayout)" 
              name="payout"
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default AdminRevenueChart;
