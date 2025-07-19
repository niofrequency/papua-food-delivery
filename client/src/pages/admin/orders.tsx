import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Store,
  User,
  Bike,
  AlertTriangle,
  ShoppingBag,
  Clock,
  Calendar,
  Eye,
  UserCog,
  Star,
} from "lucide-react";
import { format } from "date-fns";

export default function OrdersAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [assignDriverDialogOpen, setAssignDriverDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  
  const itemsPerPage = 10;

  // Status mapping for tabs and API filter
  const statusMapping: { [key: string]: string } = {
    all: "",
    pending: "pending",
    preparing: "preparing",
    ready: "ready_for_pickup",
    delivering: "out_for_delivery",
    completed: "delivered",
    cancelled: "cancelled",
  };

  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: [
      "/api/admin/orders",
      activeTab,
      searchQuery,
      dateFilter,
      sortBy,
      currentPage,
    ],
    queryFn: async () => {
      let url = "/api/admin/orders?";

      // Add status filter
      if (activeTab !== "all") {
        url += `status=${statusMapping[activeTab]}&`;
      }

      // Add search query
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      // Add date filter
      if (dateFilter !== "all") {
        url += `dateFilter=${dateFilter}&`;
      }

      // Add sorting and pagination
      url += `sortBy=${sortBy}&page=${currentPage}&limit=${itemsPerPage}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      return await response.json();
    },
  });

  // Fetch drivers for assignment
  const { data: availableDrivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["/api/admin/drivers/available"],
    queryFn: async () => {
      const response = await fetch("/api/admin/drivers/available");

      if (!response.ok) {
        throw new Error("Failed to fetch available drivers");
      }

      return await response.json();
    },
    enabled: assignDriverDialogOpen,
  });

  // Fetch order details when viewing a specific order
  const { data: orderDetails, isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: [`/api/admin/orders/${selectedOrderId}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${selectedOrderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      return await response.json();
    },
    enabled: selectedOrderId !== null,
  });

  // Assign driver mutation
  const assignDriverMutation = useMutation({
    mutationFn: async ({
      orderId,
      driverId,
    }: {
      orderId: number;
      driverId: number;
    }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${orderId}/assign-driver`, {
        driverId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Driver assigned",
        description: "The driver has been successfully assigned to this order.",
      });
      setAssignDriverDialogOpen(false);
      setSelectedDriverId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/admin/orders/${selectedOrderId}`],
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign driver",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: number;
      status: string;
    }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, {
        status,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/admin/orders/${selectedOrderId}`],
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get("searchQuery") as string);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy, h:mm a");
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Next status options based on current status
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [
          { value: "preparing", label: "Preparing" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "preparing":
        return [
          { value: "ready_for_pickup", label: "Ready for Pickup" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "ready_for_pickup":
        return [
          { value: "out_for_delivery", label: "Out for Delivery" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "out_for_delivery":
        return [
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
        ];
      default:
        return [];
    }
  };

  // Total pages calculation
  const totalPages = orders?.totalPages || 1;

  // Handle assign driver
  const handleAssignDriver = () => {
    if (selectedOrderId && selectedDriverId) {
      assignDriverMutation.mutate({
        orderId: selectedOrderId,
        driverId: selectedDriverId,
      });
    } else {
      toast({
        title: "Selection required",
        description: "Please select a driver to assign.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPortalLayout title="Orders">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
      </div>

      {/* Order Tabs and Filters */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <TabsList className="mb-4 md:mb-0">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="delivering">Delivering</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                name="searchQuery"
                placeholder="Search order #, customer..."
                className="pl-9 w-full sm:w-[200px] md:w-[250px]"
                defaultValue={searchQuery}
              />
              <Button type="submit" className="sr-only">
                Search
              </Button>
            </form>

            <div className="flex space-x-2">
              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  setDateFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Sort by: Newest</SelectItem>
                  <SelectItem value="totalAmount">Sort by: Amount</SelectItem>
                  <SelectItem value="status">Sort by: Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            {/* Orders Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : orders?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-neutral-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            No orders found
                          </h3>
                          <p className="text-neutral-500 mb-4">
                            {searchQuery
                              ? `No results found for "${searchQuery}"`
                              : activeTab !== "all"
                              ? `There are no ${activeTab} orders at the moment.`
                              : "There are no orders that match your filters."}
                          </p>
                          {(searchQuery ||
                            dateFilter !== "all" ||
                            activeTab !== "all") && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchQuery("");
                                setDateFilter("all");
                                setActiveTab("all");
                              }}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders?.data.map((order: any) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-neutral-50 cursor-pointer"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-neutral-400 mr-2" />
                            {order.customer?.fullName || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Store className="h-4 w-4 text-neutral-400 mr-2" />
                            {order.restaurant?.name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          Rp {parseFloat(order.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.driver ? (
                            <div className="flex items-center">
                              <Bike className="h-4 w-4 text-secondary mr-2" />
                              {order.driver.user?.fullName || "Assigned"}
                            </div>
                          ) : order.status === "ready_for_pickup" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderId(order.id);
                                setAssignDriverDialogOpen(true);
                              }}
                            >
                              Assign Driver
                            </Button>
                          ) : (
                            <span className="text-xs text-neutral-500">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-primary"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoadingOrders && orders?.data.length > 0 && (
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-sm text-neutral-500">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      orders?.totalCount || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {orders?.totalCount || 0}
                  </span>{" "}
                  results
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                  </Button>
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      let pageNum = currentPage;
                      // Position current page in the middle of the displayed range when possible
                      if (currentPage > 2 && totalPages > 5) {
                        pageNum = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      } else {
                        pageNum = i + 1;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog
        open={selectedOrderId !== null && !assignDriverDialogOpen}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about order #{selectedOrderId}
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrderDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !orderDetails ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Order not found</h3>
              <p className="text-neutral-500">
                The requested order details could not be loaded.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status and Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Status</h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        orderDetails.status
                      )}`}
                    >
                      {formatStatus(orderDetails.status)}
                    </span>
                    <span className="text-sm text-neutral-500 ml-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDate(orderDetails.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Update Status Action */}
                {["pending", "preparing", "ready_for_pickup", "out_for_delivery"].includes(
                  orderDetails.status
                ) && (
                  <div className="mt-3 sm:mt-0 flex items-center">
                    <Select
                      onValueChange={(value) => {
                        updateOrderStatusMutation.mutate({
                          orderId: orderDetails.id,
                          status: value,
                        });
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {getNextStatusOptions(orderDetails.status).map(
                          (option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    Customer Information
                  </h3>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-neutral-400 mr-2" />
                      <span className="font-medium">
                        {orderDetails.customer?.fullName || "Unknown"}
                      </span>
                    </div>
                    {orderDetails.customer?.phone && (
                      <p className="text-sm text-neutral-600 mb-1">
                        Phone: {orderDetails.customer.phone}
                      </p>
                    )}
                    {orderDetails.customer?.email && (
                      <p className="text-sm text-neutral-600 mb-1">
                        Email: {orderDetails.customer.email}
                      </p>
                    )}
                    <p className="text-sm text-neutral-600">
                      Delivery Address: {orderDetails.deliveryAddress}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    Restaurant Information
                  </h3>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Store className="h-4 w-4 text-neutral-400 mr-2" />
                      <span className="font-medium">
                        {orderDetails.restaurant?.name || "Unknown"}
                      </span>
                    </div>
                    {orderDetails.restaurant?.phone && (
                      <p className="text-sm text-neutral-600 mb-1">
                        Phone: {orderDetails.restaurant.phone}
                      </p>
                    )}
                    <p className="text-sm text-neutral-600">
                      Address: {orderDetails.restaurant?.address || "No address"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    Driver Information
                  </h3>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    {orderDetails.driver ? (
                      <>
                        <div className="flex items-center mb-2">
                          <Bike className="h-4 w-4 text-secondary mr-2" />
                          <span className="font-medium">
                            {orderDetails.driver.user?.fullName || "Assigned Driver"}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-1">
                          Vehicle: {orderDetails.driver.vehicleType || "N/A"}
                        </p>
                        <p className="text-sm text-neutral-600 mb-1">
                          License: {orderDetails.driver.licensePlate || "N/A"}
                        </p>
                        {orderDetails.driver.user?.phone && (
                          <p className="text-sm text-neutral-600">
                            Phone: {orderDetails.driver.user.phone}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <p className="text-sm text-neutral-500 mb-3">
                          No driver assigned yet
                        </p>
                        {orderDetails.status === "ready_for_pickup" && (
                          <Button
                            size="sm"
                            onClick={() => setAssignDriverDialogOpen(true)}
                            className="w-full"
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Assign Driver
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-3">
                  Order Items
                </h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.menuItem?.name || "Unknown Item"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            Rp {parseFloat(item.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rp {(parseFloat(item.unitPrice) * item.quantity).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Subtotal</span>
                    <span className="text-sm">
                      Rp {(parseFloat(orderDetails.totalAmount) - parseFloat(orderDetails.deliveryFee)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Delivery Fee</span>
                    <span className="text-sm">
                      Rp {parseFloat(orderDetails.deliveryFee).toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      Rp {parseFloat(orderDetails.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {orderDetails.notes && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    Order Notes
                  </h3>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="text-sm text-neutral-600">{orderDetails.notes}</p>
                  </div>
                </div>
              )}

              {/* Status History */}
              {orderDetails.statusHistory && orderDetails.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">
                    Status History
                  </h3>
                  <div className="space-y-2">
                    {orderDetails.statusHistory.map((statusItem: any, index: number) => (
                      <div
                        key={statusItem.id || index}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium">
                            {formatStatus(statusItem.status)}
                          </p>
                          <p className="text-neutral-500">
                            {formatDate(statusItem.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog
        open={assignDriverDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAssignDriverDialogOpen(false);
            setSelectedDriverId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver to Order #{selectedOrderId}</DialogTitle>
            <DialogDescription>
              Select a driver from the list of available drivers.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDrivers ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !availableDrivers || availableDrivers.length === 0 ? (
            <div className="py-6 text-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
              <p className="text-neutral-700 font-medium">No available drivers</p>
              <p className="text-sm text-neutral-500 mt-1">
                There are no drivers available to assign at the moment.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {availableDrivers.map((driver: any) => (
                  <div
                    key={driver.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriverId === driver.id
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedDriverId(driver.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                        selectedDriverId === driver.id
                          ? "border-primary"
                          : "border-neutral-300"
                      }`}
                    >
                      {selectedDriverId === driver.id && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {driver.user?.fullName || "Driver"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {driver.vehicleType} • {driver.licensePlate}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          Available
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-neutral-500">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="mr-3">{driver.rating || "New"}</span>
                        {driver.user?.phone && (
                          <span>
                            <Phone className="h-3 w-3 mr-1 inline" />
                            {driver.user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignDriverDialogOpen(false);
                    setSelectedDriverId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignDriver}
                  disabled={
                    !selectedDriverId || assignDriverMutation.isPending
                  }
                >
                  {assignDriverMutation.isPending ? "Assigning..." : "Assign Driver"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPortalLayout>
  );
}

// Missing imports
import { Phone } from "lucide-react";
