import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search as SearchIcon, 
  Store, 
  Pizza, 
  ChevronRight, 
  Star, 
  Clock,
  MapPin,
  X
} from "lucide-react";

export default function CustomerSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Get query parameter from URL if any
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");
    if (query) {
      setSearchQuery(query);
      setInitialLoad(false);
    }
  }, []);
  
  // Search API call
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/search/${activeTab}`, searchQuery],
    queryFn: async ({ queryKey }) => {
      const [endpoint, query] = queryKey;
      
      if (!query || query.trim().length < 2) {
        return { results: [] };
      }
      
      try {
        const url = `${endpoint}?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Search error:", error);
        throw error;
      }
    },
    enabled: !initialLoad && searchQuery.trim().length >= 2,
  });
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      // Update URL with search query for bookmarking/sharing
      const newUrl = `/customer/search?q=${encodeURIComponent(searchQuery)}`;
      window.history.pushState({}, "", newUrl);
      setInitialLoad(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setInitialLoad(true);
    window.history.pushState({}, "", "/customer/search");
  };
  
  // Handle restaurant click
  const handleRestaurantClick = (restaurantId: number) => {
    setLocation(`/customer/restaurant/${restaurantId}`);
  };
  
  // Render restaurant card
  const renderRestaurantCard = (restaurant: any) => (
    <Card 
      key={restaurant.id} 
      className="mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleRestaurantClick(restaurant.id)}
    >
      <div className="relative">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-neutral-200 flex items-center justify-center">
            <Store className="h-12 w-12 text-neutral-400" />
          </div>
        )}
        {restaurant.isOpen && (
          <Badge className="absolute top-2 right-2 bg-green-500">Open</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{restaurant.rating || "N/A"}</span>
          </div>
        </div>
        <div className="text-sm text-neutral-500 mb-2">
          {restaurant.categories?.map((category: string) => (
            <Badge key={category} variant="outline" className="mr-1 mb-1">
              {category}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-sm text-neutral-500 space-x-4">
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{restaurant.distance || "N/A"} km</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{restaurant.deliveryTime || "30-45"} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Render menu item card
  const renderMenuItemCard = (menuItem: any) => (
    <Card 
      key={menuItem.id} 
      className="mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleRestaurantClick(menuItem.restaurantId)}
    >
      <div className="flex">
        <div className="w-28 h-28">
          {menuItem.imageUrl ? (
            <img 
              src={menuItem.imageUrl} 
              alt={menuItem.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
              <Pizza className="h-8 w-8 text-neutral-400" />
            </div>
          )}
        </div>
        <CardContent className="p-3 flex-1">
          <h3 className="font-semibold mb-1">{menuItem.name}</h3>
          <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{menuItem.description || "No description available"}</p>
          <div className="flex justify-between items-center">
            <span className="font-medium text-primary">Rp {parseFloat(menuItem.price).toLocaleString()}</span>
            <div className="flex items-center text-sm text-neutral-600">
              <Store className="h-3.5 w-3.5 mr-1" />
              <span>{menuItem.restaurantName}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
  
  // Show search suggestions when empty
  const renderSearchSuggestions = () => (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Popular searches</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {["Nasi Goreng", "Ayam Bakar", "Seafood", "Coffee", "Papeda", "Pizza"].map((term, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className="px-3 py-2 cursor-pointer hover:bg-neutral-100"
            onClick={() => {
              setSearchQuery(term);
              setInitialLoad(false);
            }}
          >
            {term}
          </Badge>
        ))}
      </div>
      
      <h3 className="text-lg font-medium mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {["Local Food", "Seafood", "Fast Food", "Beverages", "Desserts", "Spicy"].map((category, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className="px-3 py-2 cursor-pointer hover:bg-neutral-100"
            onClick={() => {
              setSearchQuery(category);
              setInitialLoad(false);
            }}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="p-10 text-center">
      <SearchIcon className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
      <h3 className="text-lg font-medium mb-2">No results found</h3>
      <p className="text-neutral-500 mb-4">
        We couldn't find anything matching "{searchQuery}"
      </p>
      <Button onClick={clearSearch} variant="outline">
        Clear search
      </Button>
    </div>
  );
  
  // Loading state
  const renderLoadingState = () => (
    <div className="px-4">
      {activeTab === "restaurants" ? (
        <>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="mb-4 overflow-hidden">
              <Skeleton className="w-full h-40" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="mb-4 overflow-hidden">
              <div className="flex">
                <Skeleton className="w-28 h-28" />
                <CardContent className="p-3 flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
  
  // Render content based on state
  const renderContent = () => {
    if (initialLoad) {
      return renderSearchSuggestions();
    }
    
    if (isLoading) {
      return renderLoadingState();
    }
    
    if (error) {
      return (
        <div className="p-10 text-center">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-neutral-500 mb-4">
            There was an error performing your search. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      );
    }
    
    if (!data || data.results?.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div className="px-4 pb-4">
        {activeTab === "restaurants" ? (
          <>
            {data.results.map((restaurant: any) => renderRestaurantCard(restaurant))}
          </>
        ) : (
          <>
            {data.results.map((menuItem: any) => renderMenuItemCard(menuItem))}
          </>
        )}
      </div>
    );
  };
  
  return (
    <CustomerLayout>
      <div className="py-4 px-4 bg-white sticky top-0 z-10 border-b">
        {/* Search form */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <Input
            className="pl-10 pr-10"
            placeholder="Search for restaurants, dishes, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="menuItems">Menu Items</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Search results */}
      <div className="pb-16">
        {renderContent()}
      </div>
    </CustomerLayout>
  );
}