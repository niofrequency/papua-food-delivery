import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, ChevronRight, MapIcon } from "lucide-react";
import { format } from "date-fns";
import { Map } from "@/components/ui/map";

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders", activeTab],
    queryFn: async ({ queryKey }) => {
      const status = queryKey[1] === "active" 
        ? ["pending", "preparing", "ready_for_pickup", "out_for_delivery"].join(",")
        : ["delivered", "cancelled"].join(",");

      const response = await fetch(`/api/orders?status=${status}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      return await response.json();
    },
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
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
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">My Orders</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="past">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </CardContent>
                </Card>
              ))
            ) : orders?.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <div className="mx-auto w-16 h-16 bg-neutral-100 flex items-center justify-center rounded-full mb-4">
                    <Clock className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No active orders</h3>
                  <p className="text-neutral-500 mb-6">You don't have any ongoing orders at the moment.</p>
                  <Button onClick={() => setLocation("/customer/dashboard")}>
                    Browse Restaurants
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-neutral-500">
                          {format(new Date(order.createdAt), "MMM d, yyyy, h:mm a")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">{order.restaurant?.name || "Restaurant"}</h4>
                          <p className="text-sm text-neutral-500">{order.restaurant?.address || "Address unavailable"}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium">Items:</h4>
                        <ul className="text-sm text-neutral-600 mt-1">
                          {order.items?.map((item: any) => (
                            <li key={item.id} className="flex justify-between">
                              <span>{item.quantity}x {item.menuItem?.name || "Unknown item"}</span>
                              <span>Rp {parseFloat(item.unitPrice).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between font-medium text-sm mt-2 pt-2 border-t">
                          <span>Total</span>
                          <span>Rp {parseFloat(order.totalAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {(order.status === "out_for_delivery" && order.driver) && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Track Delivery</h4>
                        <div className="h-32 rounded-lg overflow-hidden mb-2">
                          {order.deliveryLatitude && order.deliveryLongitude && order.driver.currentLatitude && order.driver.currentLongitude ? (
                            <Map
                              latitude={parseFloat(order.deliveryLatitude)}
                              longitude={parseFloat(order.deliveryLongitude)}
                              height="128px"
                              markers={[
                                {
                                  latitude: parseFloat(order.deliveryLatitude),
                                  longitude: parseFloat(order.deliveryLongitude),
                                  label: "You",
                                  color: "primary"
                                },
                                {
                                  latitude: parseFloat(order.driver.currentLatitude),
                                  longitude: parseFloat(order.driver.currentLongitude),
                                  label: "🛵",
                                  color: "secondary"
                                }
                              ]}
                            />
                          ) : (
                            <div className="h-full bg-neutral-100 flex items-center justify-center">
                              <MapIcon className="h-6 w-6 text-neutral-400" />
                              <span className="ml-2 text-neutral-500">Location tracking unavailable</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center bg-neutral-50 p-3 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-3">
                            <i className="fas fa-motorcycle text-secondary"></i>
                          </div>
                          <div>
                            <p className="font-medium">{order.driver.user?.fullName || "Your Driver"}</p>
                            <p className="text-sm text-neutral-500">
                              {order.driver.vehicleType} • {order.driver.licensePlate}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="ml-auto">
                            <i className="fas fa-phone text-secondary"></i>
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setLocation(`/customer/order/${order.id}`)}
                    >
                      View Order Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </CardContent>
                </Card>
              ))
            ) : orders?.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <div className="mx-auto w-16 h-16 bg-neutral-100 flex items-center justify-center rounded-full mb-4">
                    <Clock className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No order history</h3>
                  <p className="text-neutral-500 mb-6">You haven't placed any orders yet.</p>
                  <Button onClick={() => setLocation("/customer/dashboard")}>
                    Browse Restaurants
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-neutral-500">
                          {format(new Date(order.createdAt), "MMM d, yyyy, h:mm a")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">{order.restaurant?.name || "Restaurant"}</h4>
                          <p className="text-sm text-neutral-500">{order.restaurant?.address || "Address unavailable"}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-sm font-medium">
                        <span>Total</span>
                        <span>Rp {parseFloat(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocation(`/customer/order/${order.id}`)}
                    >
                      View Order Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}
