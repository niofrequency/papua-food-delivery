import { db } from "@db";
import { users, drivers, userProfiles, restaurants, menuItems, menuCategories, 
  orders, orderItems, promotions, restaurantCategories, restaurantToCategories } from "@shared/schema";
import { eq, and, or, desc, asc, like, sql, gte, lte } from "drizzle-orm";
import { InsertUser, User, InsertDriver, InsertRestaurant, 
  InsertMenuItem, InsertOrder } from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { hashPassword } from "./auth";

// Import the pool directly since we're in an ES Module
import { pool } from "@db";

// Session store setup
const PostgresSessionStore = connectPg(session);

// Storage interface for the application
export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Omit<InsertUser, "id">): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<InsertUser, "password" | "id">>): Promise<User | undefined>;
  
  // Driver related methods
  getDriver(id: number): Promise<any | undefined>;
  getDriverByUserId(userId: number): Promise<any | undefined>;
  createDriver(driverData: Omit<InsertDriver, "id">): Promise<any>;
  updateDriverLocation(driverId: number, latitude: number, longitude: number): Promise<any | undefined>;
  updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<any | undefined>;
  
  // Restaurant related methods
  getRestaurants(options?: { categoryId?: number, search?: string, limit?: number, offset?: number }): Promise<any[]>;
  getRestaurantById(id: number): Promise<any | undefined>;
  createRestaurant(restaurantData: Omit<InsertRestaurant, "id">): Promise<any>;
  updateRestaurant(id: number, restaurantData: Partial<Omit<InsertRestaurant, "id">>): Promise<any | undefined>;
  
  // Menu related methods
  getMenuCategories(restaurantId: number): Promise<any[]>;
  getMenuItems(restaurantId?: number, categoryId?: number, searchTerm?: string): Promise<any[]>;
  getMenuItem(id: number): Promise<any | undefined>;
  createMenuItem(menuItemData: Omit<InsertMenuItem, "id">): Promise<any>;
  updateMenuItem(id: number, menuItemData: Partial<Omit<InsertMenuItem, "id">>): Promise<any | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order related methods
  getOrders(options: { 
    customerId?: number, 
    restaurantId?: number, 
    driverId?: number, 
    status?: string 
  }): Promise<any[]>;
  getOrderById(id: number): Promise<any | undefined>;
  createOrder(orderData: Omit<InsertOrder, "id">, orderItems: { menuItemId: number, quantity: number, unitPrice: number, notes?: string }[]): Promise<any>;
  updateOrderStatus(id: number, status: string, driverId?: number): Promise<any | undefined>;
  
  // Restaurant categories and promotions
  getCategories(): Promise<any[]>;
  getPromotions(): Promise<any[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
constructor() {
  // Only create PostgreSQL session store if not in Vercel serverless environment
  if (process.env.VERCEL !== "1") {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
      createTableIfMissing: true,
      schemaName: 'public'
    });
  } else {
    // Use simple memory store for Vercel to avoid serverless issues
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
}
  
  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  
  async createUser(userData: Omit<InsertUser, "id">): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    
    // Create a default profile for the user
    await db.insert(userProfiles).values({ userId: user.id }).returning();
    
    // If the user is a driver, create a driver record
    if (userData.role === "driver") {
      await db.insert(drivers).values({
        userId: user.id,
        vehicleType: "Motorcycle", // Default value
        licensePlate: "TEMP-" + user.id.toString().padStart(4, '0'), // Temporary license plate
        isAvailable: true,
      }).returning();
    }
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<Omit<InsertUser, "password" | "id">>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Driver related methods
  async getDriver(id: number): Promise<any | undefined> {
    const result = await db.select()
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id))
      .where(eq(drivers.id, id))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    // Combine driver and user data
    const { drivers: driver, users: user } = result[0];
    const { password, ...userWithoutPassword } = user;
    
    return { ...driver, user: userWithoutPassword };
  }
  
  async getDriverByUserId(userId: number): Promise<any | undefined> {
    const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
    return result[0];
  }
  
  async createDriver(driverData: Omit<InsertDriver, "id">): Promise<any> {
    const [driver] = await db.insert(drivers).values(driverData).returning();
    return driver;
  }
  
  async updateDriverLocation(driverId: number, latitude: number, longitude: number): Promise<any | undefined> {
    const [driver] = await db.update(drivers)
      .set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString()
      })
      .where(eq(drivers.id, driverId))
      .returning();
    return driver;
  }
  
  async updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<any | undefined> {
    const [driver] = await db.update(drivers)
      .set({ isAvailable })
      .where(eq(drivers.id, driverId))
      .returning();
    return driver;
  }
  
  async getAllDriversWithUsers(): Promise<any[]> {
    try {
      // Get all drivers
      const allDrivers = await db.select()
        .from(drivers);
      
      // Get user info for each driver
      const driversWithUserInfo = await Promise.all(
        allDrivers.map(async (driver) => {
          const user = await this.getUser(driver.userId);
          
          if (!user) return null;
          
          // Remove sensitive information from user
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...driver,
            user: userWithoutPassword
          };
        })
      );
      
      // Filter out any null values (drivers without valid users)
      return driversWithUserInfo.filter(driver => driver !== null);
    } catch (error) {
      console.error("Error getting all drivers with users:", error);
      return [];
    }
  }
  
  // Restaurant related methods
  async getRestaurants(options: { categoryId?: number, search?: string, limit?: number, offset?: number } = {}): Promise<any[]> {
    const { categoryId, search, limit = 20, offset = 0 } = options;
    
    let query = db.select()
      .from(restaurants)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(restaurants.rating));
    
    if (categoryId) {
      query = query
        .innerJoin(restaurantToCategories, eq(restaurants.id, restaurantToCategories.restaurantId))
        .where(eq(restaurantToCategories.categoryId, categoryId));
    }
    
    if (search) {
      query = query.where(
        or(
          like(restaurants.name, `%${search}%`),
          like(restaurants.description || '', `%${search}%`),
          like(restaurants.address, `%${search}%`)
        )
      );
    }
    
    return await query;
  }
  
  async getRestaurantById(id: number): Promise<any | undefined> {
    // Validate the ID is a valid number
    if (isNaN(id)) {
      console.error(`Invalid restaurant ID: ${id}`);
      return undefined;
    }
    
    try {
      const result = await db.select()
        .from(restaurants)
        .where(eq(restaurants.id, id))
        .limit(1);
      
      if (result.length === 0) return undefined;
      
      // Get restaurant categories
      const categories = await db.select()
        .from(restaurantToCategories)
        .innerJoin(restaurantCategories, eq(restaurantToCategories.categoryId, restaurantCategories.id))
        .where(eq(restaurantToCategories.restaurantId, id));
      
      // Combine restaurant with categories
      return {
        ...result[0],
        categories: categories.map(c => c.restaurant_categories)
      };
    } catch (error) {
      console.error(`Error fetching restaurant with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async createRestaurant(restaurantData: Omit<InsertRestaurant, "id">): Promise<any> {
    try {
      // Extract category IDs if present
      const { categoryIds, ...restData } = restaurantData as any;
      
      // Create default values for missing fields
      const dataToInsert = {
        ...restData,
        rating: restData.rating || 4.0,
        priceLevel: restData.priceLevel || "$$",
        imageUrl: restData.imageUrl || "/images/restaurants/default-restaurant.jpg",
        isOpen: true,
        openingTime: restData.openingTime || "08:00",
        closingTime: restData.closingTime || "22:00",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Start a transaction to insert restaurant and categories
      return await db.transaction(async (tx) => {
        // Insert the restaurant
        const [restaurant] = await tx.insert(restaurants).values(dataToInsert).returning();
        
        // If category IDs were provided, add restaurant-category associations
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          await Promise.all(
            categoryIds.map(async (categoryId: number) => {
              if (!isNaN(Number(categoryId))) {
                await tx.insert(restaurantToCategories).values({
                  restaurantId: restaurant.id,
                  categoryId: Number(categoryId)
                });
              }
            })
          );
        }
        
        // Get categories for this restaurant
        const categories = await tx.select()
          .from(restaurantToCategories)
          .innerJoin(restaurantCategories, eq(restaurantToCategories.categoryId, restaurantCategories.id))
          .where(eq(restaurantToCategories.restaurantId, restaurant.id));
        
        // Return restaurant with categories
        return {
          ...restaurant,
          categories: categories.map((c: any) => c.restaurant_categories)
        };
      });
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  }
  
  async updateRestaurant(id: number, restaurantData: Partial<Omit<InsertRestaurant, "id">>): Promise<any | undefined> {
    const [restaurant] = await db.update(restaurants)
      .set({ ...restaurantData, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return restaurant;
  }
  
  // Menu related methods
  async getMenuCategories(restaurantId: number): Promise<any[]> {
    const result = await db.select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurantId))
      .orderBy(asc(menuCategories.id));
    return result;
  }
  
  async getMenuItems(restaurantId?: number, categoryId?: number, searchTerm?: string): Promise<any[]> {
    let query = db.select().from(menuItems);
    
    // Apply filters
    if (restaurantId) {
      query = query.where(eq(menuItems.restaurantId, restaurantId));
    }
    
    if (categoryId) {
      query = query.where(eq(menuItems.menuCategoryId, categoryId));
    }
    
    if (searchTerm) {
      query = query.where(
        or(
          like(menuItems.name, searchTerm),
          like(menuItems.description || '', searchTerm)
        )
      );
    }
    
    return await query.orderBy(asc(menuItems.name));
  }
  
  async getMenuItem(id: number): Promise<any | undefined> {
    const result = await db.select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);
    return result[0];
  }
  
  async createMenuItem(menuItemData: Omit<InsertMenuItem, "id">): Promise<any> {
    const [menuItem] = await db.insert(menuItems).values(menuItemData).returning();
    return menuItem;
  }
  
  async updateMenuItem(id: number, menuItemData: Partial<Omit<InsertMenuItem, "id">>): Promise<any | undefined> {
    try {
      const [menuItem] = await db.update(menuItems)
        .set(menuItemData)
        .where(eq(menuItems.id, id))
        .returning();
      return menuItem;
    } catch (error) {
      console.error(`Error updating menu item with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      const result = await db.delete(menuItems)
        .where(eq(menuItems.id, id))
        .returning({ id: menuItems.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting menu item with ID ${id}:`, error);
      return false;
    }
  }
  
  // Order related methods
  async getOrders(options: { 
    customerId?: number, 
    restaurantId?: number, 
    driverId?: number, 
    status?: string 
  }): Promise<any[]> {
    const { customerId, restaurantId, driverId, status } = options;
    
    let query = db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    // Apply filters
    if (customerId) {
      query = query.where(eq(orders.customerId, customerId));
    }
    
    if (restaurantId) {
      query = query.where(eq(orders.restaurantId, restaurantId));
    }
    
    if (driverId) {
      query = query.where(eq(orders.driverId, driverId));
    }
    
    if (status) {
      query = query.where(eq(orders.status, status));
    }
    
    const result = await query;
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      result.map(async (order) => {
        const items = await db.select()
          .from(orderItems)
          .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items.map(item => ({
            ...item.order_items,
            menuItem: item.menu_items
          }))
        };
      })
    );
    
    return ordersWithItems;
  }
  
  async getOrderById(id: number): Promise<any | undefined> {
    const result = await db.select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    // Get order items
    const items = await db.select()
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));
    
    // Get restaurant details
    const restaurant = await this.getRestaurantById(result[0].restaurantId);
    
    // Get customer details
    const customer = await this.getUser(result[0].customerId);
    
    // Get driver details if assigned
    let driver;
    if (result[0].driverId) {
      driver = await this.getDriver(result[0].driverId);
    }
    
    // Combine all data
    return {
      ...result[0],
      items: items.map(item => ({
        ...item.order_items,
        menuItem: item.menu_items
      })),
      restaurant,
      customer: customer ? { 
        id: customer.id, 
        username: customer.username,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      } : null,
      driver
    };
  }
  
  async createOrder(
    orderData: Omit<InsertOrder, "id">, 
    orderItemsData: { menuItemId: number, quantity: number, unitPrice: number, notes?: string }[]
  ): Promise<any> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create the order
      const [order] = await tx.insert(orders).values(orderData).returning();
      
      // Create order items
      const items = await Promise.all(
        orderItemsData.map(async (item) => {
          const [orderItem] = await tx.insert(orderItems).values({
            ...item,
            orderId: order.id
          }).returning();
          return orderItem;
        })
      );
      
      return { ...order, items };
    });
  }
  
  async updateOrderStatus(id: number, status: string, driverId?: number): Promise<any | undefined> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      const updateData: any = { 
        status, 
        updatedAt: new Date()
      };
      
      // If driver ID is provided, assign the driver
      if (driverId) {
        updateData.driverId = driverId;
      }
      
      // Update the order
      const [order] = await tx.update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();
      
      return order;
    });
  }
  
  // Restaurant categories and promotions
  async getCategories(): Promise<any[]> {
    return await db.select().from(restaurantCategories).orderBy(asc(restaurantCategories.name));
  }
  
  async getPromotions(): Promise<any[]> {
    return await db.select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          gte(promotions.endDate, new Date()),
          lte(promotions.startDate, new Date())
        )
      )
      .orderBy(desc(promotions.startDate));
  }
}

// Export a single instance of the storage
export const storage = new DatabaseStorage();
