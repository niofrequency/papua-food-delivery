import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, Store, ShoppingBag, Users, Bike, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfWeek, addDays } from "date-fns";

// For weekly data trend
const generateWeeklyData = () => {
  const today = new Date();
  const startDay = startOfWeek(today);
  
  return Array(7)
    .fill(0)
    .map((_, i) => {
      const date = addDays(startDay, i);
      return {
        name: format(date, "EEE"),
        orders: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 2000000) + 500000,
      };
    });
};

// For monthly data trend
const generateMonthlyData = () => {
  return Array(30)
    .fill(0)
    .map((_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        name: format(date, "dd/MM"),
        orders: Math.floor(Math.random() * 15) + 10,
        revenue: Math.floor(Math.random() * 1500000) + 800000,
      };
    });
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("week");
  const [chartData, setChartData] = useState(generateWeeklyData());
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error loading statistics",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
        
        // Return fallback data for development
        return {
          restaurants: {
            total: 24,
            change: 12,
            trend: "up"
          },
          orders: {
            total: 152,
            change: 8,
            trend: "up"
          },
          customers: {
            total: 348,
            change: 15,
            trend: "up"
          },
          drivers: {
            total: 12,
            change: -3,
            trend: "down"
          },
          revenue: {
            total: 15250000,
            change: 5,
            trend: "up"
          }
        };
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
  
  // Update chart data when timeframe changes
  useEffect(() => {
    if (timeframe === "week") {
      setChartData(generateWeeklyData());
    } else if (timeframe === "month") {
      setChartData(generateMonthlyData());
    }
  }, [timeframe]);

  // Format currency in Indonesian Rupiah
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString()}`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">Orders: {payload[0].value}</p>
          <p className="text-secondary">Revenue: {formatCurrency(payload[1].value)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <AdminPortalLayout title="Dashboard">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Restaurants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-sm">Total Restaurants</p>
                <h2 className="text-3xl font-bold mt-1">
                  {isLoadingStats ? "..." : stats?.restaurants.total}
                </h2>
                {!isLoadingStats && (
                  <p className={`text-sm mt-1 flex items-center ${
                    stats?.restaurants.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stats?.restaurants.trend === "up" ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {stats?.restaurants.change}% from last month
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-full flex items-center justify-center">
                <Store className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-sm">Active Orders</p>
                <h2 className="text-3xl font-bold mt-1">
                  {isLoadingStats ? "..." : stats?.orders.total}
                </h2>
                {!isLoadingStats && (
                  <p className={`text-sm mt-1 flex items-center ${
                    stats?.orders.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stats?.orders.trend === "up" ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {stats?.orders.change}% from yesterday
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <ShoppingBag className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-sm">Total Customers</p>
                <h2 className="text-3xl font-bold mt-1">
                  {isLoadingStats ? "..." : stats?.customers.total}
                </h2>
                {!isLoadingStats && (
                  <p className={`text-sm mt-1 flex items-center ${
                    stats?.customers.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stats?.customers.trend === "up" ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {stats?.customers.change}% from last month
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
                <Users className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Drivers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-sm">Available Drivers</p>
                <h2 className="text-3xl font-bold mt-1">
                  {isLoadingStats ? "..." : stats?.drivers.total}
                </h2>
                {!isLoadingStats && (
                  <p className={`text-sm mt-1 flex items-center ${
                    stats?.drivers.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stats?.drivers.trend === "up" ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {stats?.drivers.change}% from yesterday
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
                <Bike className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-sm">Total Revenue</p>
                <h2 className="text-xl font-bold mt-1">
                  {isLoadingStats ? "..." : formatCurrency(stats?.revenue.total)}
                </h2>
                {!isLoadingStats && (
                  <p className={`text-sm mt-1 flex items-center ${
                    stats?.revenue.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stats?.revenue.trend === "up" ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {stats?.revenue.change}% from last month
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales Overview */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monitor your platform's performance over time
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={timeframe === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("week")}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant={timeframe === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("month")}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#FF5722" />
                  <YAxis yAxisId="right" orientation="right" stroke="#4CAF50" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#FF5722" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue (Rp)" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Orders by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
            <CardDescription>Top performing food categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Seafood", value: 35 },
                    { name: "Local Dishes", value: 28 },
                    { name: "BBQ", value: 18 },
                    { name: "Spicy", value: 12 },
                    { name: "Coffee & Drinks", value: 7 },
                  ]}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => [`${value} orders`, "Orders"]} />
                  <Bar dataKey="value" fill="#FFC107" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "2 minutes ago", event: "New order #8763 from John Doe" },
              { time: "15 minutes ago", event: "Driver Andi completed delivery #8759" },
              { time: "45 minutes ago", event: "New restaurant 'Warung Oma' registered" },
              { time: "1 hour ago", event: "Customer complaint for order #8752 - food was cold" },
              { time: "2 hours ago", event: "Weekly report generated" },
            ].map((activity, i) => (
              <div key={i} className="flex">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-4" />
                <div>
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-xs text-neutral-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </AdminPortalLayout>
  );
}
