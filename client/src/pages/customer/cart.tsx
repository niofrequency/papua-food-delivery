import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CartItem = {
  menuItem: any;
  quantity: number;
};

type CartData = {
  items: {
    [key: string]: CartItem;
  };
  restaurantId: string;
  restaurantName: string;
};

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart from session storage on mount
  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Update cart in session storage when it changes
  useEffect(() => {
    if (cart) {
      sessionStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Calculate totals
  const subtotal = cart
    ? Object.values(cart.items).reduce(
        (sum, item) => sum + parseFloat(item.menuItem.price) * item.quantity,
        0
      )
    : 0;
    
  const deliveryFee = 10000; // Example delivery fee
  const total = subtotal + deliveryFee;

  // Update quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (!cart) return;
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      const newItems = { ...cart.items };
      delete newItems[itemId];
      
      setCart({
        ...cart,
        items: newItems,
      });
      
      // If all items are removed, go back to restaurant
      if (Object.keys(newItems).length === 0) {
        toast({
          title: "Cart is empty",
          description: "All items have been removed from your cart.",
        });
        goToRestaurant();
      }
    } else {
      // Update quantity
      setCart({
        ...cart,
        items: {
          ...cart.items,
          [itemId]: {
            ...cart.items[itemId],
            quantity: newQuantity,
          },
        },
      });
    }
  };

  // Clear cart
  const clearCart = () => {
    sessionStorage.removeItem("cart");
    setCart(null);
    goToRestaurant();
  };

  // Go back to restaurant
  const goToRestaurant = () => {
    if (cart) {
      setLocation(`/customer/restaurant/${cart.restaurantId}`);
    } else {
      setLocation("/customer/dashboard");
    }
  };

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      // Clear cart after successful order
      sessionStorage.removeItem("cart");
      setCart(null);
      
      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed.",
      });
      
      // Redirect to orders page
      setLocation("/customer/orders");
      
      // Invalidate orders query to refresh orders list
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle place order
  const handlePlaceOrder = () => {
    if (!cart || Object.keys(cart.items).length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please provide a delivery address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare order data
    const orderItems = Object.values(cart.items).map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      notes: ""
    }));

    const orderData = {
      orderData: {
        restaurantId: parseInt(cart.restaurantId),
        totalAmount: total,
        deliveryFee: deliveryFee,
        deliveryAddress: deliveryAddress,
        notes: notes
      },
      orderItems: orderItems
    };

    placeOrderMutation.mutate(orderData);
  };

  // If no cart, redirect to dashboard
  if (!cart && !isSubmitting) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-neutral-500 mb-6">Add items to your cart from a restaurant</p>
          <Button onClick={() => setLocation("/customer/dashboard")}>
            Browse Restaurants
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={goToRestaurant}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">{cart?.restaurantName}</CardTitle>
          </CardHeader>
        </Card>

        {/* Cart Items */}
        <Card className="mb-6">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {cart && Object.entries(cart.items).map(([itemId, { menuItem, quantity }]) => (
              <div key={itemId} className="py-4 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{quantity}x</span>
                    <h3 className="font-medium ml-3">{menuItem.name}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 ml-7">
                    {menuItem.description ? menuItem.description.slice(0, 60) + (menuItem.description.length > 60 ? '...' : '') : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">Rp {(parseFloat(menuItem.price) * quantity).toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">Rp {parseFloat(menuItem.price).toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(itemId, quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center">{quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(itemId, quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t">
            <Button variant="ghost" className="text-red-500" onClick={clearCart}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </CardFooter>
        </Card>

        {/* Delivery Details */}
        <Card className="mb-6">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Delivery Address
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span>Rp {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-30">
        <Button
          className="w-full bg-primary text-white py-6 font-medium hover:bg-primary/90 transition-colors"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || placeOrderMutation.isPending}
        >
          {isSubmitting || placeOrderMutation.isPending
            ? "Processing Order..."
            : `Place Order - Rp ${total.toLocaleString()}`}
        </Button>
      </div>
    </CustomerLayout>
  );
}
