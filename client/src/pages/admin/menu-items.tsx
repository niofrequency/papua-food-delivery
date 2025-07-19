import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPortalLayout } from "@/components/layout/admin-portal-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Pencil, Search, Plus, Filter } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

// Item form schema
const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  menuCategoryId: z.coerce.number().optional(),
  restaurantId: z.coerce.number().min(1, "Restaurant is required"),
});

type MenuItem = z.infer<typeof menuItemSchema> & { id: number };

export default function MenuItemsAdmin() {
  const isMobile = useMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");

  // Forms
  const addForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      isAvailable: true,
      menuCategoryId: undefined,
      restaurantId: undefined,
    },
  });

  const editForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      isAvailable: true,
      menuCategoryId: undefined,
      restaurantId: undefined,
    },
  });

  // Fetch all menu items
  const { data: menuItemsData, isLoading: isLoadingMenuItems, refetch: refetchMenuItems } = useQuery({
    queryKey: ["/api/menu-items"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/menu-items");
      return await res.json();
    },
  });

  // Fetch all restaurants for dropdown
  const { data: restaurantsData, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["/api/restaurants"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/restaurants");
      return await res.json();
    },
  });

  // Fetch menu categories when a restaurant is selected
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/restaurants", selectedRestaurant, "menu-categories"],
    queryFn: async () => {
      if (!selectedRestaurant) return [];
      const res = await apiRequest("GET", `/api/restaurants/${selectedRestaurant}/menu-categories`);
      return await res.json();
    },
    enabled: !!selectedRestaurant,
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof menuItemSchema>) => {
      const res = await apiRequest("POST", "/api/menu-items", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu item created",
        description: "Menu item has been created successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      refetchMenuItems();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create menu item",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof menuItemSchema> }) => {
      const res = await apiRequest("PUT", `/api/menu-items/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu item updated",
        description: "Menu item has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentItem(null);
      refetchMenuItems();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update menu item",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/menu-items/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu item deleted",
        description: "Menu item has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
      refetchMenuItems();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete menu item",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update state when data is fetched
  useEffect(() => {
    if (menuItemsData) {
      setMenuItems(menuItemsData);
    }
  }, [menuItemsData]);

  useEffect(() => {
    if (restaurantsData) {
      setRestaurants(restaurantsData);
    }
  }, [restaurantsData]);

  useEffect(() => {
    if (categoriesData) {
      setMenuCategories(categoriesData);
    }
  }, [categoriesData]);

  // Handlers
  const handleAddSubmit = (data: z.infer<typeof menuItemSchema>) => {
    createMenuItemMutation.mutate(data);
  };

  const handleEditSubmit = (data: z.infer<typeof menuItemSchema>) => {
    if (currentItem) {
      updateMenuItemMutation.mutate({ id: currentItem.id, data });
    }
  };

  const handleDelete = () => {
    if (currentItem) {
      deleteMenuItemMutation.mutate(currentItem.id);
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setCurrentItem(item);
    editForm.reset({
      name: item.name,
      description: item.description || "",
      price: item.price,
      image: item.image || "",
      isAvailable: item.isAvailable,
      menuCategoryId: item.menuCategoryId,
      restaurantId: item.restaurantId,
    });
    setSelectedRestaurant(item.restaurantId.toString());
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminPortalLayout title="Menu Items">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Menu Items Management</h1>
        <p className="text-muted-foreground">
          Add, edit, and manage menu items across all restaurants
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="w-full md:w-[300px] pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>
                  Create a new menu item for a restaurant. Fill in all the required fields.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 mt-4">
                  {/* Restaurant selection field */}
                  <FormField
                    control={addForm.control}
                    name="restaurantId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                            setSelectedRestaurant(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a restaurant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {restaurants.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Menu Category field */}
                  <FormField
                    control={addForm.control}
                    name="menuCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menu Category (Optional)</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={!selectedRestaurant || menuCategories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {menuCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Name field */}
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter menu item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description field */}
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter menu item description" 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Price field */}
                  <FormField
                    control={addForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image URL field */}
                  <FormField
                    control={addForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Availability field */}
                  <FormField
                    control={addForm.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Available</FormLabel>
                          <FormDescription>
                            Make this menu item available to order
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createMenuItemMutation.isPending}>
                      {createMenuItemMutation.isPending ? "Creating..." : "Create Menu Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Menu items table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            Total menu items: {filteredMenuItems.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMenuItems ? (
            <div className="flex justify-center items-center p-8">
              <p>Loading menu items...</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No menu items found.</p>
              <p className="text-sm mt-2">
                {searchQuery ? "Try a different search term." : "Add a menu item to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenuItems.map((item) => {
                    // Find restaurant and category names
                    const restaurant = restaurants.find(r => r.id === item.restaurantId);
                    const category = menuCategories.find(c => c.id === item.menuCategoryId);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{restaurant?.name || "Unknown"}</TableCell>
                        <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                        <TableCell>{category?.name || "Uncategorized"}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={item.isAvailable} 
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of this menu item.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 mt-4">
              {/* Restaurant selection field */}
              <FormField
                control={editForm.control}
                name="restaurantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setSelectedRestaurant(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a restaurant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Menu Category field */}
              <FormField
                control={editForm.control}
                name="menuCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Category (Optional)</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={!selectedRestaurant || menuCategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {menuCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Name field */}
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter menu item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description field */}
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter menu item description" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Price field */}
              <FormField
                control={editForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image URL field */}
              <FormField
                control={editForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Availability field */}
              <FormField
                control={editForm.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>
                        Make this menu item available to order
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMenuItemMutation.isPending}>
                  {updateMenuItemMutation.isPending ? "Updating..." : "Update Menu Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMenuItemMutation.isPending}
            >
              {deleteMenuItemMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPortalLayout>
  );
}