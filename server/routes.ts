import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // API prefix
  const apiPrefix = "/api";

  // Restaurant related routes
  // Administrative endpoints first (specific routes before general routes)
  app.get(`${apiPrefix}/restaurants/admin`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const restaurants = await storage.getRestaurants({});
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants for admin:", error);
      res.status(500).json({ message: "Failed to fetch restaurants for admin" });
    }
  });
  
  // Public restaurant endpoint
  app.get(`${apiPrefix}/restaurants`, async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const restaurants = await storage.getRestaurants({ categoryId, search, limit, offset });
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get(`${apiPrefix}/restaurants/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurantById(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post(`${apiPrefix}/restaurants`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const restaurant = await storage.createRestaurant(req.body);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.put(`${apiPrefix}/restaurants/:id`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.updateRestaurant(id, req.body);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });

  // Menu related routes
  app.get(`${apiPrefix}/restaurants/:id/menu-categories`, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categories = await storage.getMenuCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching menu categories:", error);
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.get(`${apiPrefix}/restaurants/:id/menu-items`, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const menuItems = await storage.getMenuItems(restaurantId, categoryId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  
  // Admin menu item management routes
  app.get(`${apiPrefix}/menu-items`, async (req, res) => {
    try {
      // Get all menu items from all restaurants
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching all menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  
  app.post(`${apiPrefix}/menu-items`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });
  
  app.put(`${apiPrefix}/menu-items/:id`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.updateMenuItem(id, req.body);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });
  
  app.delete(`${apiPrefix}/menu-items/:id`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Order related routes
  app.get(`${apiPrefix}/orders`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const options: { 
        customerId?: number; 
        restaurantId?: number; 
        driverId?: number;
        status?: string;
      } = {};
      
      // Filter based on user role
      if (req.user.role === "customer") {
        options.customerId = req.user.id;
      } else if (req.user.role === "driver") {
        const driver = await storage.getDriverByUserId(req.user.id);
        if (driver) {
          options.driverId = driver.id;
        } else {
          return res.status(404).json({ message: "Driver record not found" });
        }
      }
      
      // Apply additional filters from query params
      if (req.query.restaurantId) {
        options.restaurantId = parseInt(req.query.restaurantId as string);
      }
      
      if (req.query.status) {
        options.status = req.query.status as string;
      }
      
      const orders = await storage.getOrders(options);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Ensure user can only access their own orders unless admin or the assigned driver
      if (
        req.user.role !== "admin" && 
        order.customerId !== req.user.id &&
        !(req.user.role === "driver" && order.driverId === req.user.id)
      ) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post(`${apiPrefix}/orders`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders" });
    }
    
    try {
      const { orderData, orderItems } = req.body;
      
      // Set customer ID from the authenticated user
      orderData.customerId = req.user.id;
      
      const order = await storage.createOrder(orderData, orderItems);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put(`${apiPrefix}/orders/:id/status`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { status, driverId } = req.body;
      
      // Get current order to check permissions
      const currentOrder = await storage.getOrderById(id);
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to update status
      const isAdmin = req.user.role === "admin";
      const isRestaurantOwner = req.user.id === currentOrder.restaurant.ownerId;
      const isAssignedDriver = req.user.role === "driver" && currentOrder.driverId === req.user.id;
      const isCustomer = req.user.id === currentOrder.customerId && status === "cancelled";
      
      if (!isAdmin && !isRestaurantOwner && !isAssignedDriver && !isCustomer) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(id, status, driverId);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Driver related routes
  app.get(`${apiPrefix}/drivers`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      // Get all drivers from storage
      const driversWithUsers = await storage.getAllDriversWithUsers();
      res.json(driversWithUsers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.put(`${apiPrefix}/drivers/location`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "driver") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const { latitude, longitude } = req.body;
      const driver = await storage.getDriverByUserId(req.user.id);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      
      const updatedDriver = await storage.updateDriverLocation(driver.id, latitude, longitude);
      res.json(updatedDriver);
    } catch (error) {
      console.error("Error updating driver location:", error);
      res.status(500).json({ message: "Failed to update driver location" });
    }
  });

  app.put(`${apiPrefix}/drivers/availability`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "driver") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const { isAvailable } = req.body;
      const driver = await storage.getDriverByUserId(req.user.id);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      
      const updatedDriver = await storage.updateDriverAvailability(driver.id, isAvailable);
      res.json(updatedDriver);
    } catch (error) {
      console.error("Error updating driver availability:", error);
      res.status(500).json({ message: "Failed to update driver availability" });
    }
  });

  // Categories and promotions
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get(`${apiPrefix}/promotions`, async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  // Search routes
  app.get(`${apiPrefix}/search/restaurants`, async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const searchTerm = `%${q}%`;
      const results = await storage.getRestaurants({
        search: searchTerm,
        limit: 10
      });
      
      // Format the results to include more details
      const formattedResults = results.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        imageUrl: restaurant.imageUrl,
        rating: restaurant.rating,
        categories: restaurant.categories?.map(cat => cat.name) || [],
        isOpen: true, // This would ideally check operating hours
        distance: (Math.random() * 5 + 0.5).toFixed(1), // Placeholder for distance calculation
        deliveryTime: `${(20 + Math.floor(Math.random() * 25))} min` // Placeholder for delivery estimate
      }));
      
      res.json({ results: formattedResults });
    } catch (error) {
      console.error("Error searching restaurants:", error);
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });
  
  app.get(`${apiPrefix}/search/menuItems`, async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const searchTerm = `%${q}%`;
      
      // Get menu items matching the search term
      const menuItems = await storage.getMenuItems(undefined, undefined, searchTerm);
      
      // Get restaurant details for each menu item
      const menuItemsWithDetails = await Promise.all(
        menuItems.map(async (item) => {
          let restaurant = null;
          // Make sure restaurantId is a valid number before querying
          if (item.restaurantId && !isNaN(Number(item.restaurantId))) {
            restaurant = await storage.getRestaurantById(Number(item.restaurantId));
          }
          
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
            restaurantId: item.restaurantId,
            restaurantName: restaurant?.name || "Unknown Restaurant"
          };
        })
      );
      
      res.json({ results: menuItemsWithDetails });
    } catch (error) {
      console.error("Error searching menu items:", error);
      res.status(500).json({ message: "Failed to search menu items" });
    }
  });

  // Driver earnings routes
  app.get(`${apiPrefix}/drivers/earnings`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "driver") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const driver = await storage.getDriverByUserId(req.user.id);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      
      // Get completed orders
      const options = {
        driverId: driver.id,
        status: "delivered"
      };
      
      const completedOrders = await storage.getOrders(options);
      
      // Calculate earnings
      const totalEarnings = completedOrders.reduce((sum, order) => {
        // Assuming deliveryFee is the driver's earnings
        return sum + parseFloat(order.deliveryFee || "0");
      }, 0);
      
      // Mock some daily data for the chart
      const now = new Date();
      const dailyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Generate a somewhat realistic random amount
        const amount = Math.round((Math.random() * 50 + 20) * 100) / 100;
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          amount
        });
      }
      
      // Calculate weekly total
      const weeklyTotal = dailyData.reduce((sum, day) => sum + day.amount, 0);
      
      // Mock some popular routes
      const topRoutes = [
        { from: "Central Papua", to: "University Area", count: Math.floor(Math.random() * 10) + 5 },
        { from: "Harbour District", to: "Shopping Mall", count: Math.floor(Math.random() * 8) + 3 },
        { from: "Residential Zone", to: "Business District", count: Math.floor(Math.random() * 7) + 2 }
      ];
      
      res.json({
        summary: {
          totalEarnings,
          totalOrders: completedOrders.length,
          averagePerOrder: completedOrders.length ? totalEarnings / completedOrders.length : 0,
          weeklyTotal,
          percentChange: 5.2 // Mock percentage change
        },
        dailyData,
        topRoutes,
        recentOrders: completedOrders.slice(0, 5)
      });
    } catch (error) {
      console.error("Error fetching driver earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings data" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
