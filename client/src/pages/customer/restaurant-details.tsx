import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, Clock, Heart, ArrowLeft, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>("popular");
  const [cartItems, setCartItems] = useState<{
    [key: string]: { menuItem: any; quantity: number };
  }>({});

  // Fetch restaurant details
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: [`/api/restaurants/${id}`],
    enabled: !!id,
  });

  // Fetch menu categories
  const { data: menuCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: [`/api/restaurants/${id}/menu-categories`],
    enabled: !!id,
  });

  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery({
    queryKey: [`/api/restaurants/${id}/menu-items`, activeCategory],
    queryFn: async () => {
      const url = new URL(`/api/restaurants/${id}/menu-items`, window.location.origin);
      
      if (activeCategory && activeCategory !== "popular") {
        url.searchParams.append("categoryId", activeCategory);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch menu items");
      }
      
      return await response.json();
    },
    enabled: !!id,
  });

  // Add to favorites mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      const res = await apiRequest("POST", `/api/favorites`, { restaurantId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant saved!",
        description: "This restaurant has been added to your favorites.",
      });
      // Invalidate restaurant query to update UI
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${id}`] });
    },
    onError: () => {
      toast({
        title: "Failed to save restaurant",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Add item to cart
  const addToCart = (item: any) => {
    setCartItems((prevItems) => {
      const newItems = { ...prevItems };
      if (newItems[item.id]) {
        newItems[item.id] = {
          ...newItems[item.id],
          quantity: newItems[item.id].quantity + 1,
        };
      } else {
        newItems[item.id] = { menuItem: item, quantity: 1 };
      }
      return newItems;
    });

    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  // Calculate total cart items and price
  const totalItems = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  
  const totalPrice = Object.values(cartItems).reduce(
    (sum, item) => sum + parseFloat(item.menuItem.price) * item.quantity,
    0
  );

  // Handle view cart
  const viewCart = () => {
    // Store cart in sessionStorage before navigating
    sessionStorage.setItem("cart", JSON.stringify({
      items: cartItems,
      restaurantId: id,
      restaurantName: restaurant?.name || ""
    }));
    setLocation("/customer/cart");
  };

  // Go back
  const goBack = () => {
    setLocation("/customer/dashboard");
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <header className="relative z-10">
        <div className="relative h-64">
          {isLoadingRestaurant ? (
            <Skeleton className="w-full h-full" />
          ) : restaurant?.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <Button 
            variant="secondary" 
            size="icon"
            className="absolute top-4 left-4 rounded-full shadow-md"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon"
            className="absolute top-4 right-4 rounded-full shadow-md"
            onClick={() => toggleFavoriteMutation.mutate(id)}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${restaurant?.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <div className="absolute bottom-4 left-4 text-white">
            {isLoadingRestaurant ? (
              <>
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-4 w-40 mt-2 bg-white/20" />
                <Skeleton className="h-4 w-36 mt-1 bg-white/20" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm">{restaurant?.rating || "New"}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    {restaurant?.categories?.map((c: any) => c.name).join(", ") || "Restaurant"}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    {restaurant?.distance || ""}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{restaurant?.openingTime} - {restaurant?.closingTime}</span>
                  <span className="mx-2">•</span>
                  <span className="text-success">Free delivery</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Menu Categories */}
      <div className="sticky top-[57px] bg-white z-20 border-b border-neutral-200">
        <div className="container mx-auto px-4">
          {isLoadingCategories ? (
            <div className="flex space-x-6 overflow-x-auto py-3 hide-scrollbar">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-7 w-20" />
              ))}
            </div>
          ) : (
            <Tabs 
              value={activeCategory || "popular"} 
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="flex h-auto p-0 bg-transparent space-x-6 overflow-x-auto hide-scrollbar py-3">
                <TabsTrigger 
                  value="popular"
                  className="px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Popular
                </TabsTrigger>
                {menuCategories?.map((category: any) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id.toString()}
                    className="px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-4 pb-28">
        {isLoadingMenuItems ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden border border-neutral-100">
                <div className="flex">
                  <Skeleton className="w-24 h-24" />
                  <div className="p-3 flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No menu items</h3>
            <p className="text-neutral-500">
              This restaurant hasn't added any menu items in this category yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {menuItems?.map((item: any) => (
              <Card key={item.id} className="overflow-hidden border border-neutral-100">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                        <span className="text-neutral-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {item.description || "No description available"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-primary">
                        Rp {parseFloat(item.price).toLocaleString()}
                      </span>
                      {cartItems[item.id] ? (
                        <div className="flex items-center space-x-3">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              setCartItems(prev => {
                                const newItems = {...prev};
                                if (newItems[item.id].quantity > 1) {
                                  newItems[item.id] = {
                                    ...newItems[item.id],
                                    quantity: newItems[item.id].quantity - 1
                                  };
                                } else {
                                  delete newItems[item.id];
                                }
                                return newItems;
                              });
                            }}
                          >
                            <span className="text-lg font-semibold">-</span>
                          </Button>
                          <span className="font-medium">{cartItems[item.id].quantity}</span>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-primary"
                            onClick={() => addToCart(item)}
                          >
                            <span className="text-lg font-semibold">+</span>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          className="w-8 h-8 bg-primary rounded-full"
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-30">
          <Button
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-between"
            onClick={viewCart}
          >
            <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-sm">
              {totalItems}
            </span>
            <span>View Cart</span>
            <span className="font-semibold">
              Rp {totalPrice.toLocaleString()}
            </span>
          </Button>
        </div>
      )}
    </CustomerLayout>
  );
}
