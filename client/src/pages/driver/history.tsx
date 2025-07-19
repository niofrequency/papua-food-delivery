import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DriverLayout } from "@/components/layout/driver-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isToday, isYesterday, addDays, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, MapPin, Package, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DriverHistory() {
  const [, setLocation] = useLocation();
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch order history
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders/history", dateFilter, statusFilter],
    queryFn: async ({ queryKey }) => {
      const [_, date, status] = queryKey;
      
      let queryParams = "";
      
      // Add date filter
      if (date) {
        const formattedDate = format(date as Date, "yyyy-MM-dd");
        queryParams += `date=${formattedDate}`;
      }
      
      // Add status filter
      if (status && status !== "all") {
        queryParams += queryParams ? "&" : "";
        queryParams += `status=${status}`;
      }
      
      const url = `/api/orders/history${queryParams ? `?${queryParams}` : ""}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }
      
      return await response.json();
    },
  });

  // Calculate total earnings
  const totalEarnings = (orders && Array.isArray(orders)) 
    ? orders.reduce((sum: number, order: any) => {
        return sum + parseFloat(order.deliveryFee || 0);
      }, 0)
    : 0;

  // Get formatted date for display
  const getFormattedDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  // Get formatted time for display
  const getFormattedTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DriverLayout>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Delivery History</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full sm:w-auto",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? getFormattedDate(dateFilter) : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                disabled={(date) => date > new Date()}
                defaultMonth={dateFilter}
                fromMonth={startOfMonth(addDays(new Date(), -90))}
                toMonth={endOfMonth(new Date())}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-neutral-500">Total Orders</h3>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : orders?.length || 0}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-neutral-500">Total Earnings</h3>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : `Rp ${totalEarnings.toLocaleString()}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !orders || !Array.isArray(orders) || orders.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-neutral-100 flex items-center justify-center rounded-full mb-4">
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-neutral-500 mb-6">
                {dateFilter && isToday(dateFilter)
                  ? "You haven't completed any deliveries today."
                  : `No orders found for ${getFormattedDate(dateFilter)}.`}
              </p>
              <Button onClick={() => setDateFilter(new Date())}>View Today's Orders</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 pb-8">
            {orders.map((order: any) => (
              <Card 
                key={order.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/driver/order/${order.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {getFormattedTime(order.updatedAt || order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status === "delivered" ? "Delivered" : "Cancelled"}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center text-xs">
                      <MapPin className="h-3 w-3 text-secondary mr-1" />
                      <span className="truncate">{order.restaurant?.name || "Restaurant"}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <span className="truncate">{order.deliveryAddress?.split(',')[0] || "Customer"}</span>
                    </div>
                    <span className="ml-auto text-sm font-medium text-secondary">
                      Rp {parseFloat(order.deliveryFee || "0").toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DriverLayout>
  );
}
