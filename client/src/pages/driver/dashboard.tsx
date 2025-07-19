import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DriverLayout } from "@/components/layout/driver-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Wallet, Star, Package, Map, CheckCircle, MapPin, Store, Phone } from "lucide-react";
import { Map as MapComponent } from "@/components/ui/map";
import { format } from "date-fns";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Fetch driver profile
  const { data: driver, isLoading: isLoadingDriver } = useQuery({
    queryKey: ["/api/drivers/profile"],
    queryFn: async () => {
      const response = await fetch("/api/drivers/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch driver profile");
      }
      return await response.json();
    },
  });

  // Fetch current orders
  const { data: currentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/orders", "active"],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=ready_for_pickup,out_for_delivery");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return await response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch today's orders history
  const { data: todayOrders, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/orders", "today"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/orders?status=delivered&date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to fetch today's orders");
      }
      return await response.json();
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (coordinates: { latitude: number; longitude: number }) => {
      const res = await apiRequest("PUT", "/api/drivers/location", coordinates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdatingLocation(false);
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Get current position and update periodically
  useEffect(() => {
    const getCurrentPosition = () => {
      if (navigator.geolocation) {
        setIsUpdatingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ latitude, longitude });
            updateLocationMutation.mutate({ latitude, longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location error",
              description: "Unable to get your current location. Please enable location services.",
              variant: "destructive",
            });
            setIsUpdatingLocation(false);
          }
        );
      } else {
        toast({
          title: "Location not supported",
          description: "Your browser doesn't support geolocation.",
          variant: "destructive",
        });
      }
    };

    // Get position immediately
    getCurrentPosition();

    // Update position every 3 minutes
    const intervalId = setInterval(getCurrentPosition, 3 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [toast, updateLocationMutation]);

  // Handle order action (pickup/deliver)
  const handleOrderAction = (orderId: number, currentStatus: string) => {
    const newStatus = currentStatus === "ready_for_pickup" ? "out_for_delivery" : "delivered";
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Calculate daily stats
  const totalDeliveries = todayOrders?.length || 0;
  const totalEarnings = todayOrders?.reduce((sum: number, order: any) => {
    return sum + parseFloat(order.deliveryFee || 0);
  }, 0) || 0;

  return (
    <DriverLayout>
      {/* Stats Overview */}
      <div className="p-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-600">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-secondary">{totalDeliveries}</h3>
                <p className="text-xs text-neutral-500 mt-1">Deliveries</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-secondary">
                  {isLoadingDriver ? <Skeleton className="h-8 w-16 mx-auto" /> : driver?.rating || "N/A"}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Rating</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-secondary">
                  Rp {totalEarnings.toLocaleString()}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Position Map */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Current Location</h2>
        <Card className="overflow-hidden">
          <div className="h-48">
            {currentPosition ? (
              <MapComponent
                latitude={currentPosition.latitude}
                longitude={currentPosition.longitude}
                zoom={15}
                height="192px"
                markers={[
                  {
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                    label: "🛵",
                    color: "secondary",
                  },
                ]}
              />
            ) : (
              <div className="h-full bg-neutral-100 flex items-center justify-center">
                <Map className="h-6 w-6 text-neutral-400 mr-2" />
                <span className="text-neutral-500">Acquiring location...</span>
              </div>
            )}
          </div>
          <CardContent className="py-3 text-sm text-center text-neutral-500">
            {isUpdatingLocation ? (
              "Updating your location..."
            ) : currentPosition ? (
              "Your current location is being shared"
            ) : (
              "Location sharing is required for deliveries"
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Order */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Current Orders</h2>
        
        {isLoadingOrders ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : !currentOrders || currentOrders.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-neutral-100 flex items-center justify-center rounded-full mb-4">
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No active orders</h3>
              <p className="text-neutral-500 mb-2">You don't have any orders to deliver at the moment.</p>
              <p className="text-neutral-500 text-sm">New orders will appear here when available.</p>
            </CardContent>
          </Card>
        ) : (
          currentOrders.map((order: any) => (
            <Card key={order.id} className="mb-4 overflow-hidden">
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <p className="text-xs text-neutral-500 mt-1">{order.items?.length || 0} items • Rp {parseFloat(order.totalAmount).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === "ready_for_pickup" 
                      ? "bg-blue-100 text-blue-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {order.status === "ready_for_pickup" ? "Pickup" : "Delivery"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex mb-4">
                  <div className="w-10 flex-shrink-0 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center">
                      <Store className="h-3 w-3 text-secondary" />
                    </div>
                    <div className="flex-1 border-l border-dashed border-neutral-300 mx-auto my-1"></div>
                    <div className="w-6 h-6 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium">{order.restaurant?.name || "Restaurant"}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{order.restaurant?.address || "Address unavailable"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{order.customer?.fullName || "Customer"}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{order.deliveryAddress || "Address unavailable"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-neutral-500">Ordered at</span>
                    <p className="text-sm font-medium">
                      {format(new Date(order.createdAt), "h:mm a")}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Distance</span>
                    <p className="text-sm font-medium">~3.5 km</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Earnings</span>
                    <p className="text-sm font-medium text-secondary">
                      Rp {parseFloat(order.deliveryFee || "0").toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-neutral-50 flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1 py-2 border border-secondary text-secondary font-medium"
                  onClick={() => {
                    // In a real app, this would open the phone app with the customer's number
                    toast({
                      title: "Calling customer",
                      description: "This feature would connect you with the customer.",
                    });
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" /> Call Customer
                </Button>
                <Button 
                  className="flex-1 py-2 bg-secondary text-white font-medium"
                  onClick={() => handleOrderAction(order.id, order.status)}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> 
                  {updateOrderStatusMutation.isPending
                    ? "Processing..."
                    : order.status === "ready_for_pickup"
                      ? "Complete Pickup"
                      : "Complete Delivery"
                  }
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order History */}
      <div className="p-4 pb-20">
        <h2 className="text-lg font-semibold mb-3">Today's Orders</h2>
        
        {isLoadingHistory ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !todayOrders || todayOrders.length === 0 ? (
          <Card className="text-center p-6">
            <p className="text-neutral-500">You haven't completed any deliveries today</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayOrders.map((order: any) => (
              <Link key={order.id} href={`/driver/order/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Order #{order.id}</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Completed at {format(new Date(order.updatedAt), "h:mm a")}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center">
                        <MapPin className="text-primary h-4 w-4 mr-2" />
                        <span className="text-xs truncate max-w-[200px]">
                          {order.restaurant?.name} → {order.deliveryAddress?.split(',')[0]}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-secondary">
                        Rp {parseFloat(order.deliveryFee || "0").toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DriverLayout>
  );
}
