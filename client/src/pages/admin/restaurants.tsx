import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Edit, Trash2, Plus, Search, Star, Filter, ChevronRight, ChevronLeft, Store } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Form validation schema for restaurant
const restaurantFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(5, "Phone must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  description: z.string().optional(),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  categoryIds: z.array(z.number()).min(1, "At least one category is required"),
});

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

export default function RestaurantsAdmin() {
  const { toast } = useToast();
  const [isAddingRestaurant, setIsAddingRestaurant] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Set up restaurant form
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      description: "",
      openingTime: "08:00",
      closingTime: "20:00",
      latitude: "-2.5916",  // Default to Papua region
      longitude: "140.6690",
      categoryIds: [],
    },
  });

  // Fetch restaurants
  const { data: restaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["/api/restaurants/admin", searchQuery, categoryFilter, statusFilter, sortBy, currentPage],
    queryFn: async () => {
      try {
        let url = "/api/restaurants/admin?";
        
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        
        if (categoryFilter) {
          url += `categoryId=${categoryFilter}&`;
        }
        
        if (statusFilter !== "all") {
          url += `status=${statusFilter}&`;
        }
        
        url += `sortBy=${sortBy}&page=${currentPage}&limit=${itemsPerPage}`;
        
        // Use apiRequest to include authentication
        const response = await apiRequest("GET", url);
        const data = await response.json();
        
        console.log("Fetched restaurant data:", data); // For debugging
        
        // Format response to match expected structure
        const formattedData = Array.isArray(data) ? data : [];
        return {
          data: formattedData,
          totalPages: 1,  // For now, just return 1 as totalPages since API doesn't return pagination info
          totalCount: formattedData.length  // Add totalCount property
        };
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        // Return empty data on error to avoid UI crashes
        return {
          data: [],
          totalPages: 1,
          totalCount: 0
        };
      }
    },
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/categories");
        return await response.json();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormValues) => {
      const res = await apiRequest("POST", "/api/restaurants", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant created",
        description: "The restaurant has been created successfully.",
      });
      setIsAddingRestaurant(false);
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/admin"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create restaurant",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update restaurant mutation
  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: RestaurantFormValues }) => {
      const res = await apiRequest("PUT", `/api/restaurants/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant updated",
        description: "The restaurant has been updated successfully.",
      });
      setEditingRestaurant(null);
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/admin"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update restaurant",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete restaurant mutation
  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/restaurants/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant deleted",
        description: "The restaurant has been deleted successfully.",
      });
      setDeleteRestaurantId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/admin"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete restaurant",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission for creating restaurant
  const onSubmit = (data: RestaurantFormValues) => {
    if (editingRestaurant) {
      updateRestaurantMutation.mutate({ id: editingRestaurant.id, data });
    } else {
      createRestaurantMutation.mutate(data);
    }
  };

  // Handle edit restaurant
  const handleEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    form.reset({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email || "",
      description: restaurant.description || "",
      openingTime: restaurant.openingTime,
      closingTime: restaurant.closingTime,
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      categoryIds: restaurant.categories?.map((c: any) => c.id) || [],
    });
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get("searchQuery") as string);
  };

  // Total pages calculation
  const totalPages = restaurants?.totalPages || 1;

  return (
    <AdminPortalLayout title="Restaurants">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <Dialog open={isAddingRestaurant} onOpenChange={setIsAddingRestaurant}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent-dark text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Enter the details of the new restaurant below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter restaurant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter latitude" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter longitude" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter restaurant description" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories*</FormLabel>
                      <FormDescription>
                        Select at least one category for this restaurant
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {isLoadingCategories ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          categories?.map((category: any) => (
                            <Label
                              key={category.id}
                              className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-neutral-50"
                            >
                              <input
                                type="checkbox"
                                value={category.id}
                                checked={field.value.includes(category.id)}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  const newValue = e.target.checked
                                    ? [...field.value, value]
                                    : field.value.filter((id) => id !== value);
                                  field.onChange(newValue);
                                }}
                              />
                              <span>{category.name}</span>
                            </Label>
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}
                  >
                    {createRestaurantMutation.isPending || updateRestaurantMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingRestaurant ? "Updating..." : "Creating..."}
                      </span>
                    ) : (
                      <span>{editingRestaurant ? "Update Restaurant" : "Add Restaurant"}</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Restaurant Dialog */}
        <Dialog open={!!editingRestaurant} onOpenChange={(open) => !open && setEditingRestaurant(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Restaurant</DialogTitle>
              <DialogDescription>
                Update the details of the restaurant below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter restaurant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter latitude" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter longitude" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter restaurant description" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories*</FormLabel>
                      <FormDescription>
                        Select at least one category for this restaurant
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {isLoadingCategories ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          categories?.map((category: any) => (
                            <Label
                              key={category.id}
                              className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-neutral-50"
                            >
                              <input
                                type="checkbox"
                                value={category.id}
                                checked={field.value.includes(category.id)}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  const newValue = e.target.checked
                                    ? [...field.value, value]
                                    : field.value.filter((id) => id !== value);
                                  field.onChange(newValue);
                                }}
                              />
                              <span>{category.name}</span>
                            </Label>
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingRestaurant(null)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateRestaurantMutation.isPending}
                  >
                    {updateRestaurantMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Restaurant"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteRestaurantId !== null}
          onOpenChange={(open) => !open && setDeleteRestaurantId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete this restaurant and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (deleteRestaurantId !== null) {
                    deleteRestaurantMutation.mutate(deleteRestaurantId);
                  }
                }}
                disabled={deleteRestaurantMutation.isPending}
              >
                {deleteRestaurantMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h2 className="text-lg font-semibold font-poppins mb-4 md:mb-0">Restaurant List</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  name="searchQuery"
                  placeholder="Search restaurants..."
                  className="pl-9 w-full sm:w-[200px] md:w-[250px]"
                  defaultValue={searchQuery}
                />
                <Button type="submit" className="sr-only">Search</Button>
              </form>
              
              <div className="flex space-x-2">
                <Select
                  value={categoryFilter?.toString() || "all"}
                  onValueChange={(value) => {
                    setCategoryFilter(value === "all" ? null : Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                    <SelectItem value="name">Sort by: Name</SelectItem>
                    <SelectItem value="rating">Sort by: Rating</SelectItem>
                    <SelectItem value="createdAt">Sort by: Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Restaurants Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRestaurants ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : restaurants?.data && restaurants.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <Store className="h-8 w-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
                      <p className="text-neutral-500 mb-4">
                        {searchQuery
                          ? `No results found for "${searchQuery}"`
                          : "There are no restaurants that match your filters."}
                      </p>
                      {(searchQuery || categoryFilter || statusFilter !== "all") && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter(null);
                            setStatusFilter("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                restaurants?.data && restaurants.data.map((restaurant: any) => (
                  <TableRow key={restaurant.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200 flex items-center justify-center">
                          {restaurant.logo ? (
                            <img 
                              src={restaurant.logo} 
                              alt={restaurant.name} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <Store className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{restaurant.name}</div>
                          <div className="text-xs text-neutral-500">ID: #{restaurant.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-900">{restaurant.address.split(',')[0]}</div>
                      <div className="text-xs text-neutral-500">
                        {restaurant.address.split(',').slice(1).join(',').trim()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.categories && restaurant.categories.length > 0 ? (
                          restaurant.categories.slice(0, 1).map((category: any) => (
                            <span 
                              key={category.id} 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary bg-opacity-10 text-secondary"
                            >
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs">No category</span>
                        )}
                        {restaurant.categories && restaurant.categories.length > 1 && (
                          <span className="text-xs text-neutral-500">+{restaurant.categories.length - 1} more</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        restaurant.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-100 text-neutral-800"
                      }`}>
                        {restaurant.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{restaurant.rating || "New"}</span>
                        {restaurant.reviewCount && <span className="text-neutral-400 ml-1">({restaurant.reviewCount})</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditRestaurant(restaurant)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            // This would navigate to a view page in a real app
                            toast({
                              title: "View Restaurant",
                              description: `Viewing details for ${restaurant.name}`,
                            });
                          }}
                          className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteRestaurantId(restaurant.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {!isLoadingRestaurants && restaurants?.data && restaurants.data.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, restaurants?.totalCount || 0)}
              </span> of{" "}
              <span className="font-medium">{restaurants?.totalCount || 0}</span> results
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
              })}
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
      </div>
    </AdminPortalLayout>
  );
}
