
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AdminRevenueChartProps {
  periodFilter: 'day' | 'week' | 'month' | 'year';
}

const AdminRevenueChart = ({ periodFilter }: AdminRevenueChartProps) => {
  const data = useMemo(() => {
    // Generate data based on the selected period filter
    if (periodFilter === 'day') {
      return [
        { name: '12AM', revenue: 12000, payout: 8400 },
        { name: '3AM', revenue: 8000, payout: 5600 },
        { name: '6AM', revenue: 16000, payout: 11200 },
        { name: '9AM', revenue: 25000, payout: 17500 },
        { name: '12PM', revenue: 40000, payout: 28000 },
        { name: '3PM', revenue: 35000, payout: 24500 },
        { name: '6PM', revenue: 45000, payout: 31500 },
        { name: '9PM', revenue: 25000, payout: 17500 },
      ];
    } 
    else if (periodFilter === 'week') {
      return [
        { name: 'Mon', revenue: 45000, payout: 31500 },
        { name: 'Tue', revenue: 52000, payout: 36400 },
        { name: 'Wed', revenue: 48000, payout: 33600 },
        { name: 'Thu', revenue: 61000, payout: 42700 },
        { name: 'Fri', revenue: 55000, payout: 38500 },
        { name: 'Sat', revenue: 67000, payout: 46900 },
        { name: 'Sun', revenue: 42000, payout: 29400 },
      ];
    }
    else if (periodFilter === 'month') {
      return [
        { name: 'Week 1', revenue: 320000, payout: 224000 },
        { name: 'Week 2', revenue: 280000, payout: 196000 },
        { name: 'Week 3', revenue: 350000, payout: 245000 },
        { name: 'Week 4', revenue: 290000, payout: 203000 },
      ];
    }
    else { // year
      return [
        { name: 'Jan', revenue: 900000, payout: 630000 },
        { name: 'Feb', revenue: 870000, payout: 609000 },
        { name: 'Mar', revenue: 950000, payout: 665000 },
        { name: 'Apr', revenue: 1020000, payout: 714000 },
        { name: 'May', revenue: 980000, payout: 686000 },
        { name: 'Jun', revenue: 1150000, payout: 805000 },
        { name: 'Jul', revenue: 1080000, payout: 756000 },
        { name: 'Aug', revenue: 1200000, payout: 840000 },
        { name: 'Sep', revenue: 1300000, payout: 910000 },
        { name: 'Oct', revenue: 1400000, payout: 980000 },
        { name: 'Nov', revenue: 1250000, payout: 875000 },
        { name: 'Dec', revenue: 1300000, payout: 910000 },
      ];
    }
  }, [periodFilter]);

  // Format currency for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }
    return `₦${value}`;
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

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
