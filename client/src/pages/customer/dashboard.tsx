import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin, Star, Clock, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useMobile();

  // Fetch restaurant categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants", selectedCategory, searchQuery],
    queryFn: async () => {
      const url = new URL("/api/restaurants", window.location.origin);
      
      if (selectedCategory) {
        url.searchParams.append("categoryId", selectedCategory.toString());
      }
      
      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      
      return await response.json();
    },
  });

  // Fetch promotions
  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ["/api/promotions"],
  });

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem("searchInput") as HTMLInputElement;
    setSearchQuery(input.value);
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got user position:", position.coords.latitude, position.coords.longitude);
          // Here you could update user location on the server
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Enable location for better restaurant recommendations",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  return (
    <CustomerLayout>
      {/* Hero Banner */}
      <div className="relative">
        <div className="bg-gradient-to-r from-primary to-secondary h-40 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="container mx-auto px-4 py-6 relative z-10">
            <h1 className="text-white text-2xl font-bold mb-2">PapuaEats</h1>
            <p className="text-white text-opacity-90">Discover and enjoy local tastes</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto px-4 relative -mt-6">
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-3 flex items-center">
            <Search className="text-neutral-400 ml-2 mr-3 h-5 w-5" />
            <Input 
              type="text" 
              name="searchInput"
              placeholder="Search for restaurants or dishes" 
              className="flex-1 text-sm py-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" size="sm" variant="ghost" className="ml-2">Search</Button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          
          {categoriesLoading ? (
            <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-14 h-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
              <div 
                className={`flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer`}
                onClick={() => setSelectedCategory(null)}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedCategory === null ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                  <span className="text-xl">All</span>
                </div>
                <span className="text-xs text-neutral-700 whitespace-nowrap">All</span>
              </div>
              
              {categories?.map((category: any) => (
                <div 
                  key={category.id} 
                  className={`flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedCategory === category.id ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                    {category.icon ? (
                      <span dangerouslySetInnerHTML={{ __html: category.icon }} />
                    ) : (
                      <span className="text-xl">{category.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-700 whitespace-nowrap">{category.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Special Offers */}
      {(promotions?.length > 0 || promotionsLoading) && (
        <div className="py-2">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold mb-3">Special Offers</h2>
            
            {promotionsLoading ? (
              <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="w-64 h-32 rounded-xl flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
                {promotions?.map((promo: any) => (
                  <div key={promo.id} className="relative w-64 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {promo.image ? (
                      <img 
                        src={promo.image} 
                        alt={promo.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-secondary" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {promo.discount ? `${promo.discount}% OFF` : 'Special Deal'}
                      </span>
                      <h3 className="text-sm font-semibold mt-1">{promo.title}</h3>
                      <p className="text-xs text-white text-opacity-90">
                        Valid until {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popular Restaurants */}
      <div className="py-4 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Popular Restaurants</h2>
            <Button variant="link" className="text-primary p-0 h-auto">View all</Button>
          </div>
          
          {restaurantsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <div className="flex items-center space-x-2 mt-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants?.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
              <p className="text-neutral-500 mb-4">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : "There are no restaurants available in this category."}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {restaurants?.map((restaurant: any) => (
                <Link key={restaurant.id} href={`/customer/restaurant/${restaurant.id}`}>
                  <a className="block">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-40">
                        {restaurant.coverImage ? (
                          <img 
                            src={restaurant.coverImage} 
                            alt={restaurant.name}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-neutral-500">No image available</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-white text-primary text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            {restaurant.rating} <Star className="h-3 w-3 text-yellow-400 inline" />
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 opacity-60"></div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-xs text-neutral-500 mt-1">
                              <MapPin className="h-3 w-3 text-primary inline mr-1" />
                              <span>{restaurant.address}</span>
                              {restaurant.distance && (
                                <span> • {restaurant.distance} away</span>
                              )}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {restaurant.categories?.map((category: any) => (
                                <span key={category.id} className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500">
                              <Clock className="h-3 w-3 inline mr-1" /> 20-30 min
                            </div>
                            <div className="text-xs text-success mt-1">
                              <CheckCircle className="h-3 w-3 inline mr-1" /> Free delivery
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
