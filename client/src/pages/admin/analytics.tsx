import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from "recharts";
import { Calendar, TrendingUp, Download, Zap, Utensils, Star, Clock, MapPin, DollarSign, BarChart2 } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

// Custom color palette
const COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#607D8B', '#795548', '#E91E63'];

export default function AnalyticsAdmin() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedView, setSelectedView] = useState("sales");
  const [categoryChartView, setCategoryChartView] = useState("orders");
  const [locationChartView, setLocationChartView] = useState("orders");
  
  // Calculate date range based on selection
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch (timeRange) {
      case "7days":
        startDate = subDays(today, 6);
        endDate = today;
        break;
      case "30days":
        startDate = subDays(today, 29);
        endDate = today;
        break;
      case "thisWeek":
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case "lastMonth":
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
        break;
      default:
        startDate = subDays(today, 6);
        endDate = today;
    }
    
    return { startDate, endDate };
  };
  
  // Format date range for display
  const formatDateRange = () => {
    const { startDate, endDate } = getDateRange();
    return `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}`;
  };
  
  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics", timeRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      let url = `/api/admin/analytics?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          title: "Error loading analytics",
          description: "Failed to load analytics data. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
  });

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
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("Revenue") 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const pieData = analyticsData?.categoryData || [
    { name: "Seafood", value: 35 },
    { name: "Local Dishes", value: 28 },
    { name: "BBQ", value: 18 },
    { name: "Spicy", value: 12 },
    { name: "Drinks", value: 7 },
  ];
  
  const locationData = analyticsData?.locationData || [
    { name: "Jayapura", value: 42 },
    { name: "Sentani", value: 23 },
    { name: "Abepura", value: 18 },
    { name: "Waena", value: 12 },
    { name: "Other", value: 5 },
  ];
  
  const timeData = analyticsData?.timeData || [
    { name: "6:00 - 8:59", value: 12 },
    { name: "9:00 - 11:59", value: 18 },
    { name: "12:00 - 14:59", value: 35 },
    { name: "15:00 - 17:59", value: 25 },
    { name: "18:00 - 20:59", value: 30 },
    { name: "21:00 - 23:59", value: 15 },
  ];
  
  // Generates trend data for charts
  const trendData = analyticsData?.trendData || (() => {
    const { startDate, endDate } = getDateRange();
    const days = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      days.push({
        date: format(currentDate, "MMM dd"),
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 10000000) + 2000000,
      });
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  })();
  
  // Populate performance metrics
  const metrics = analyticsData?.summary || {
    totalOrders: 342,
    totalRevenue: 25780000,
    averageOrderValue: 75380,
    orderGrowth: 12.5,
    revenueGrowth: 18.3,
    topCategory: "Seafood",
    topLocation: "Jayapura",
    peakTime: "12:00 - 14:59",
  };
  
  return (
    <AdminPortalLayout title="Analytics">
      {/* Header with date range selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-neutral-500">
            {formatDateRange()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Date Range</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.totalOrders}</h3>
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.orderGrowth}% vs previous
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalRevenue)}</h3>
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.revenueGrowth}% vs previous
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Average Order Value</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.averageOrderValue)}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Per order
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Top Category</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.topCategory}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Most popular
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Utensils className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
        </TabsList>
        
        {/* Sales & Orders Tab */}
        <TabsContent value="sales" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Orders Trend</CardTitle>
              <CardDescription>
                Track order and revenue trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#FF5722" />
                    <YAxis yAxisId="right" orientation="right" stroke="#4CAF50" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#FF5722"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#4CAF50"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-0">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>
                  Breakdown of performance by food category
                </CardDescription>
              </div>
              <Select
                value={categoryChartView}
                onValueChange={setCategoryChartView}
              >
                <SelectTrigger className="w-[140px] mt-2 sm:mt-0">
                  <span>View by</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ${categoryChartView === 'revenue' ? ' (Rp)' : ''}`, categoryChartView === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Locations Tab */}
        <TabsContent value="locations" className="mt-0">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Location Analysis</CardTitle>
                <CardDescription>
                  Breakdown of performance by location
                </CardDescription>
              </div>
              <Select
                value={locationChartView}
                onValueChange={setLocationChartView}
              >
                <SelectTrigger className="w-[140px] mt-2 sm:mt-0">
                  <span>View by</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                    />
                    <Tooltip formatter={(value) => [`${value} ${locationChartView === 'revenue' ? ' (Rp)' : ''}`, locationChartView === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name={locationChartView === 'revenue' ? 'Revenue' : 'Orders'}
                      fill="#2196F3"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <p className="text-sm text-neutral-500 mb-2">Top performing location</p>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-medium">{metrics.topLocation}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Time Analysis Tab */}
        <TabsContent value="time" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Time of Day Analysis</CardTitle>
              <CardDescription>
                Order patterns throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeData}
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
                    <Tooltip formatter={(value) => [`${value} orders`, 'Orders']} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Orders"
                      fill="#9C27B0"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <p className="text-sm text-neutral-500 mb-2">Peak ordering time</p>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="font-medium">{metrics.peakTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Seafood Paradise", orders: 56, rating: 4.8 },
                { name: "Warung Makan Enak", orders: 42, rating: 4.7 },
                { name: "Papuan Delight", orders: 38, rating: 4.9 },
                { name: "Sup Ikan Papua", orders: 35, rating: 4.6 },
              ].map((restaurant, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{restaurant.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {restaurant.orders} orders
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Food Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Papeda Ikan Kuah Kuning", orders: 78 },
                { name: "Udang Bakar Papua", orders: 65 },
                { name: "Nasi Kuning Papua", orders: 52 },
                { name: "Sate Ulat Sagu", orders: 47 },
              ].map((food, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-accent">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{food.name}</p>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {food.orders} orders
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "James Wenda", deliveries: 42, rating: 4.9 },
                { name: "Martha Kogoya", deliveries: 38, rating: 4.8 },
                { name: "Dani Tabuni", deliveries: 35, rating: 4.7 },
                { name: "Yosep Waropen", deliveries: 32, rating: 4.6 },
              ].map((driver, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-secondary">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {driver.deliveries} deliveries
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPortalLayout>
  );
}