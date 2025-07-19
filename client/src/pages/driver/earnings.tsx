import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DriverLayout } from "@/components/layout/driver-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  BarChart3, 
  CalendarDays, 
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DriverEarnings() {
  const [dateRange, setDateRange] = useState("week");
  const [activeTab, setActiveTab] = useState("summary");
  
  // Calculate date range based on selection
  const today = new Date();
  let startDate: Date, endDate: Date;
  
  switch (dateRange) {
    case "today":
      startDate = today;
      endDate = today;
      break;
    case "week":
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
      break;
    case "month":
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      break;
    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    default:
      startDate = subDays(today, 7);
      endDate = today;
  }

  // Format dates for API
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");
  
  // Fetch earnings data from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/drivers/earnings", formattedStartDate, formattedEndDate],
    queryFn: async ({ queryKey }) => {
      const [endpoint, start, end] = queryKey;
      const url = `${endpoint}?startDate=${start}&endDate=${end}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch earnings: ${response.status}`);
      }
      
      return await response.json();
    }
  });
  
  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };
  
  // Render summary cards
  const renderSummaryCards = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error || !data) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load earnings data. Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
    
    const summary = data.summary;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Banknote className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalEarnings)}
                </p>
                <div className="flex items-center text-xs text-neutral-500">
                  <span className={`flex items-center ${summary.percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {summary.percentChange >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(summary.percentChange)}%
                  </span>
                  <span className="ml-1">vs previous period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {summary.totalOrders}
                </p>
                <p className="text-xs text-neutral-500">deliveries completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Per Order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.averagePerOrder)}
                </p>
                <p className="text-xs text-neutral-500">per delivery average</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{dateRange === "week" ? "Weekly" : dateRange === "month" ? "Monthly" : "Period"} Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.weeklyTotal || 0)}
                </p>
                <p className="text-xs text-neutral-500">
                  {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render trends chart
  const renderTrendsChart = () => {
    if (isLoading) {
      return <Skeleton className="w-full h-[300px] mt-4" />;
    }
    
    if (error || !data || !data.dailyData) {
      return <p className="text-center mt-4">Failed to load chart data.</p>;
    }
    
    return (
      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.dailyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), "MMM d")}
              stroke="#94a3b8"
            />
            <YAxis 
              tickFormatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
              stroke="#94a3b8"
            />
            <Tooltip 
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Earnings"]}
              labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render top routes
  const renderTopRoutes = () => {
    if (isLoading) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top Delivery Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      );
    }
    
    if (error || !data || !data.topRoutes) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top Delivery Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load route data.</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Delivery Routes</CardTitle>
          <CardDescription>Your most frequent delivery areas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Deliveries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topRoutes.map((route: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{route.from}</TableCell>
                  <TableCell>{route.to}</TableCell>
                  <TableCell>{route.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  // Render recent orders
  const renderRecentOrders = () => {
    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      );
    }
    
    if (error || !data || !data.recentOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load recent orders data.</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest completed deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "MMM d, h:mm a")}</TableCell>
                    <TableCell>{order.restaurantName || "Restaurant"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(order.deliveryFee || "0"))}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-neutral-500">
                    No completed orders found in this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <DriverLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
            <p className="text-neutral-500 mt-1">
              Track your delivery earnings and performance
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            {/* Summary Cards */}
            {renderSummaryCards()}
            
            {/* Earnings Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
                <CardDescription>
                  Your delivery earnings from {format(startDate, "MMMM d")} to {format(endDate, "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTrendsChart()}
              </CardContent>
            </Card>
            
            {/* Top Routes */}
            {renderTopRoutes()}
          </TabsContent>
          
          <TabsContent value="history">
            {/* Recent Orders */}
            {renderRecentOrders()}
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  );
}