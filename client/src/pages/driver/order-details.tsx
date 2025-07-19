import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DriverLayout } from "@/components/layout/driver-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "@/components/ui/map";
import { ArrowLeft, MapPin, Phone, Store, Clock, Receipt, Info } from "lucide-react";
import { format } from "date-fns";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });

  // Go back
  const goBack = () => {
    setLocation("/driver/dashboard");
  };

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready_for_pickup":
        return "bg-blue-100 text-blue-800";
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

  // Format status text
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <DriverLayout>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Order Details</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-40 w-full mb-6 rounded-lg" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-28 w-full mb-6 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : !order ? (
        <div className="container mx-auto px-4 py-6 text-center">
          <Card className="p-6">
            <Info className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">Order not found</h2>
            <p className="text-neutral-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={goBack}>Return to Dashboard</Button>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6 pb-20">
          {/* Order Info */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id}</CardTitle>
                  <p className="text-sm text-neutral-500 mt-1">
                    {format(new Date(order.createdAt), "MMM d, yyyy, h:mm a")}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-neutral-500 mr-2" />
                <span className="text-sm">
                  {order.status === "delivered"
                    ? `Delivered at ${format(new Date(order.updatedAt), "h:mm a")}`
                    : `Order placed at ${format(new Date(order.createdAt), "h:mm a")}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Locations Map */}
          {(order.deliveryLatitude && order.deliveryLongitude && order.restaurant?.latitude && order.restaurant?.longitude) && (
            <Card className="mb-6 overflow-hidden">
              <div className="h-48">
                <Map
                  latitude={parseFloat(order.deliveryLatitude)}
                  longitude={parseFloat(order.deliveryLongitude)}
                  zoom={13}
                  height="192px"
                  markers={[
                    {
                      latitude: parseFloat(order.restaurant.latitude),
                      longitude: parseFloat(order.restaurant.longitude),
                      label: "R",
                      color: "secondary"
                    },
                    {
                      latitude: parseFloat(order.deliveryLatitude),
                      longitude: parseFloat(order.deliveryLongitude),
                      label: "D",
                      color: "primary"
                    }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* Pickup and Delivery */}
          <Card className="mb-6">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-base">Pickup and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex">
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
                  <div className="mb-4">
                    <h4 className="text-sm font-medium">{order.restaurant?.name || "Restaurant"}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{order.restaurant?.address || "Address unavailable"}</p>
                    
                    {order.restaurant?.phone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-8 text-xs font-normal"
                        onClick={() => window.open(`tel:${order.restaurant.phone}`, '_blank')}
                      >
                        <Phone className="h-3 w-3 mr-1" /> Call Restaurant
                      </Button>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{order.customer?.fullName || "Customer"}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{order.deliveryAddress || "Address unavailable"}</p>
                    
                    {order.customer?.phone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-8 text-xs font-normal"
                        onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
                      >
                        <Phone className="h-3 w-3 mr-1" /> Call Customer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-base flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-2 space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="font-medium mr-2">{item.quantity}x</div>
                      <div>{item.menuItem?.name || "Unknown item"}</div>
                    </div>
                    <div>
                      Rp {(parseFloat(item.unitPrice) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <h4 className="text-sm font-medium mb-1">Order Notes:</h4>
                  <p className="text-sm text-neutral-600">{order.notes}</p>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>
                    Rp {(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Delivery Fee</span>
                  <span>Rp {parseFloat(order.deliveryFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>Rp {parseFloat(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-base">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Delivery Fee (Your Earnings)</span>
                <span className="font-semibold text-secondary">
                  Rp {parseFloat(order.deliveryFee).toLocaleString()}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-100 text-sm text-neutral-500">
                <p>Payment was handled through the app.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DriverLayout>
  );
}
