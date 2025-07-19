var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import path3 from "path";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  driverReviews: () => driverReviews,
  driverReviewsRelations: () => driverReviewsRelations,
  drivers: () => drivers,
  driversRelations: () => driversRelations,
  insertDriverSchema: () => insertDriverSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertRestaurantSchema: () => insertRestaurantSchema,
  insertUserSchema: () => insertUserSchema,
  menuCategories: () => menuCategories,
  menuCategoriesRelations: () => menuCategoriesRelations,
  menuItems: () => menuItems,
  menuItemsRelations: () => menuItemsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusHistory: () => orderStatusHistory,
  orderStatusHistoryRelations: () => orderStatusHistoryRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  promotions: () => promotions,
  promotionsRelations: () => promotionsRelations,
  restaurantCategories: () => restaurantCategories,
  restaurantCategoriesRelations: () => restaurantCategoriesRelations,
  restaurantReviews: () => restaurantReviews,
  restaurantReviewsRelations: () => restaurantReviewsRelations,
  restaurantToCategories: () => restaurantToCategories,
  restaurantToCategoriesRelations: () => restaurantToCategoriesRelations,
  restaurants: () => restaurants,
  restaurantsRelations: () => restaurantsRelations,
  selectDriverSchema: () => selectDriverSchema,
  selectMenuItemSchema: () => selectMenuItemSchema,
  selectOrderSchema: () => selectOrderSchema,
  selectRestaurantSchema: () => selectRestaurantSchema,
  selectUserSchema: () => selectUserSchema,
  userProfiles: () => userProfiles,
  userProfilesRelations: () => userProfilesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["customer", "driver", "admin"] }).notNull().default("customer"),
  address: text("address"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  avatar: text("avatar"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  bio: text("bio")
}, (table) => {
  return {
    userIdIdx: uniqueIndex("user_profiles_user_id_idx").on(table.userId)
  };
});
var drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleType: text("vehicle_type").notNull(),
  licensePlate: text("license_plate").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 6 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 6 }),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0")
}, (table) => {
  return {
    userIdIdx: uniqueIndex("drivers_user_id_idx").on(table.userId)
  };
});
var restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  openingTime: text("opening_time").notNull(),
  closingTime: text("closing_time").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"),
  isActive: boolean("is_active").notNull().default(true),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var restaurantCategories = pgTable("restaurant_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon")
});
var restaurantToCategories = pgTable("restaurant_to_categories", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  categoryId: integer("category_id").notNull().references(() => restaurantCategories.id)
}, (table) => {
  return {
    restaurantCategoryIdx: uniqueIndex("restaurant_category_idx").on(table.restaurantId, table.categoryId)
  };
});
var menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id)
});
var menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isAvailable: boolean("is_available").notNull().default(true),
  menuCategoryId: integer("menu_category_id").references(() => menuCategories.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id)
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  driverId: integer("driver_id").references(() => drivers.id),
  status: text("status", { enum: ["pending", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"] }).notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 6, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 6 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 10, scale: 6 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes")
});
var orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status", { enum: ["pending", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes")
});
var restaurantReviews = pgTable("restaurant_reviews", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var driverReviews = pgTable("driver_reviews", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  image: text("image"),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  isActive: boolean("is_active").notNull().default(true)
});
var usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId]
  }),
  ownedRestaurants: many(restaurants),
  orders: many(orders, { relationName: "customerOrders" }),
  restaurantReviews: many(restaurantReviews),
  driverReviews: many(driverReviews)
}));
var userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));
var driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id]
  }),
  orders: many(orders),
  reviews: many(driverReviews)
}));
var restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id]
  }),
  categories: many(restaurantToCategories),
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  orders: many(orders),
  reviews: many(restaurantReviews),
  promotions: many(promotions)
}));
var restaurantCategoriesRelations = relations(restaurantCategories, ({ many }) => ({
  restaurants: many(restaurantToCategories)
}));
var restaurantToCategoriesRelations = relations(restaurantToCategories, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantToCategories.restaurantId],
    references: [restaurants.id]
  }),
  category: one(restaurantCategories, {
    fields: [restaurantToCategories.categoryId],
    references: [restaurantCategories.id]
  })
}));
var menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuCategories.restaurantId],
    references: [restaurants.id]
  }),
  menuItems: many(menuItems)
}));
var menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id]
  }),
  menuCategory: one(menuCategories, {
    fields: [menuItems.menuCategoryId],
    references: [menuCategories.id]
  }),
  orderItems: many(orderItems)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders"
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id]
  }),
  driver: one(drivers, {
    fields: [orders.driverId],
    references: [drivers.id]
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  restaurantReview: many(restaurantReviews),
  driverReview: many(driverReviews)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id]
  })
}));
var orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id]
  })
}));
var restaurantReviewsRelations = relations(restaurantReviews, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantReviews.restaurantId],
    references: [restaurants.id]
  }),
  customer: one(users, {
    fields: [restaurantReviews.customerId],
    references: [users.id]
  }),
  order: one(orders, {
    fields: [restaurantReviews.orderId],
    references: [orders.id]
  })
}));
var driverReviewsRelations = relations(driverReviews, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverReviews.driverId],
    references: [drivers.id]
  }),
  customer: one(users, {
    fields: [driverReviews.customerId],
    references: [users.id]
  }),
  order: one(orders, {
    fields: [driverReviews.orderId],
    references: [orders.id]
  })
}));
var promotionsRelations = relations(promotions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [promotions.restaurantId],
    references: [restaurants.id]
  })
}));
var insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  role: (schema) => schema.refine((val) => ["customer", "driver", "admin"].includes(val), {
    message: "Role must be customer, driver, or admin"
  })
});
var insertRestaurantSchema = createInsertSchema(restaurants, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  address: (schema) => schema.min(5, "Address must be at least 5 characters"),
  phone: (schema) => schema.min(5, "Phone must be at least 5 characters")
});
var insertMenuItemSchema = createInsertSchema(menuItems, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  price: (schema) => schema.refine((val) => Number(val) > 0, {
    message: "Price must be greater than 0"
  })
});
var insertOrderSchema = createInsertSchema(orders, {
  deliveryAddress: (schema) => schema.min(5, "Delivery address must be at least 5 characters"),
  totalAmount: (schema) => schema.refine((val) => Number(val) >= 0, {
    message: "Total amount must be a positive number"
  }),
  deliveryFee: (schema) => schema.refine((val) => Number(val) >= 0, {
    message: "Delivery fee must be a positive number"
  })
});
var insertDriverSchema = createInsertSchema(drivers, {
  vehicleType: (schema) => schema.min(2, "Vehicle type must be at least 2 characters"),
  licensePlate: (schema) => schema.min(2, "License plate must be at least 2 characters")
});
var selectUserSchema = createSelectSchema(users);
var selectRestaurantSchema = createSelectSchema(restaurants);
var selectMenuItemSchema = createSelectSchema(menuItems);
var selectOrderSchema = createSelectSchema(orders);
var selectDriverSchema = createSelectSchema(drivers);

// db/index.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, or, desc, asc, like, gte, lte } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    if (process.env.VERCEL !== "1") {
      this.sessionStore = new PostgresSessionStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
          max: 10,
          idleTimeoutMillis: 3e4,
          connectionTimeoutMillis: 2e3
        },
        createTableIfMissing: true,
        schemaName: "public"
      });
    } else {
      const MemoryStore = __require("memorystore")(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      });
    }
  }
  // User related methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    await db.insert(userProfiles).values({ userId: user.id }).returning();
    if (userData.role === "driver") {
      await db.insert(drivers).values({
        userId: user.id,
        vehicleType: "Motorcycle",
        // Default value
        licensePlate: "TEMP-" + user.id.toString().padStart(4, "0"),
        // Temporary license plate
        isAvailable: true
      }).returning();
    }
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  // Driver related methods
  async getDriver(id) {
    const result = await db.select().from(drivers).leftJoin(users, eq(drivers.userId, users.id)).where(eq(drivers.id, id)).limit(1);
    if (result.length === 0) return void 0;
    const { drivers: driver, users: user } = result[0];
    const { password, ...userWithoutPassword } = user;
    return { ...driver, user: userWithoutPassword };
  }
  async getDriverByUserId(userId) {
    const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
    return result[0];
  }
  async createDriver(driverData) {
    const [driver] = await db.insert(drivers).values(driverData).returning();
    return driver;
  }
  async updateDriverLocation(driverId, latitude, longitude) {
    const [driver] = await db.update(drivers).set({
      currentLatitude: latitude.toString(),
      currentLongitude: longitude.toString()
    }).where(eq(drivers.id, driverId)).returning();
    return driver;
  }
  async updateDriverAvailability(driverId, isAvailable) {
    const [driver] = await db.update(drivers).set({ isAvailable }).where(eq(drivers.id, driverId)).returning();
    return driver;
  }
  async getAllDriversWithUsers() {
    try {
      const allDrivers = await db.select().from(drivers);
      const driversWithUserInfo = await Promise.all(
        allDrivers.map(async (driver) => {
          const user = await this.getUser(driver.userId);
          if (!user) return null;
          const { password, ...userWithoutPassword } = user;
          return {
            ...driver,
            user: userWithoutPassword
          };
        })
      );
      return driversWithUserInfo.filter((driver) => driver !== null);
    } catch (error) {
      console.error("Error getting all drivers with users:", error);
      return [];
    }
  }
  // Restaurant related methods
  async getRestaurants(options = {}) {
    const { categoryId, search, limit = 20, offset = 0 } = options;
    let query = db.select().from(restaurants).limit(limit).offset(offset).orderBy(desc(restaurants.rating));
    if (categoryId) {
      query = query.innerJoin(restaurantToCategories, eq(restaurants.id, restaurantToCategories.restaurantId)).where(eq(restaurantToCategories.categoryId, categoryId));
    }
    if (search) {
      query = query.where(
        or(
          like(restaurants.name, `%${search}%`),
          like(restaurants.description || "", `%${search}%`),
          like(restaurants.address, `%${search}%`)
        )
      );
    }
    return await query;
  }
  async getRestaurantById(id) {
    if (isNaN(id)) {
      console.error(`Invalid restaurant ID: ${id}`);
      return void 0;
    }
    try {
      const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
      if (result.length === 0) return void 0;
      const categories = await db.select().from(restaurantToCategories).innerJoin(restaurantCategories, eq(restaurantToCategories.categoryId, restaurantCategories.id)).where(eq(restaurantToCategories.restaurantId, id));
      return {
        ...result[0],
        categories: categories.map((c) => c.restaurant_categories)
      };
    } catch (error) {
      console.error(`Error fetching restaurant with ID ${id}:`, error);
      return void 0;
    }
  }
  async createRestaurant(restaurantData) {
    try {
      const { categoryIds, ...restData } = restaurantData;
      const dataToInsert = {
        ...restData,
        rating: restData.rating || 4,
        priceLevel: restData.priceLevel || "$$",
        imageUrl: restData.imageUrl || "/images/restaurants/default-restaurant.jpg",
        isOpen: true,
        openingTime: restData.openingTime || "08:00",
        closingTime: restData.closingTime || "22:00",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      return await db.transaction(async (tx) => {
        const [restaurant] = await tx.insert(restaurants).values(dataToInsert).returning();
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          await Promise.all(
            categoryIds.map(async (categoryId) => {
              if (!isNaN(Number(categoryId))) {
                await tx.insert(restaurantToCategories).values({
                  restaurantId: restaurant.id,
                  categoryId: Number(categoryId)
                });
              }
            })
          );
        }
        const categories = await tx.select().from(restaurantToCategories).innerJoin(restaurantCategories, eq(restaurantToCategories.categoryId, restaurantCategories.id)).where(eq(restaurantToCategories.restaurantId, restaurant.id));
        return {
          ...restaurant,
          categories: categories.map((c) => c.restaurant_categories)
        };
      });
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  }
  async updateRestaurant(id, restaurantData) {
    const [restaurant] = await db.update(restaurants).set({ ...restaurantData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(restaurants.id, id)).returning();
    return restaurant;
  }
  // Menu related methods
  async getMenuCategories(restaurantId) {
    const result = await db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId)).orderBy(asc(menuCategories.id));
    return result;
  }
  async getMenuItems(restaurantId, categoryId, searchTerm) {
    let query = db.select().from(menuItems);
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
          like(menuItems.description || "", searchTerm)
        )
      );
    }
    return await query.orderBy(asc(menuItems.name));
  }
  async getMenuItem(id) {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    return result[0];
  }
  async createMenuItem(menuItemData) {
    const [menuItem] = await db.insert(menuItems).values(menuItemData).returning();
    return menuItem;
  }
  async updateMenuItem(id, menuItemData) {
    try {
      const [menuItem] = await db.update(menuItems).set(menuItemData).where(eq(menuItems.id, id)).returning();
      return menuItem;
    } catch (error) {
      console.error(`Error updating menu item with ID ${id}:`, error);
      return void 0;
    }
  }
  async deleteMenuItem(id) {
    try {
      const result = await db.delete(menuItems).where(eq(menuItems.id, id)).returning({ id: menuItems.id });
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting menu item with ID ${id}:`, error);
      return false;
    }
  }
  // Order related methods
  async getOrders(options) {
    const { customerId, restaurantId, driverId, status } = options;
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
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
    const ordersWithItems = await Promise.all(
      result.map(async (order) => {
        const items = await db.select().from(orderItems).innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, order.id));
        return {
          ...order,
          items: items.map((item) => ({
            ...item.order_items,
            menuItem: item.menu_items
          }))
        };
      })
    );
    return ordersWithItems;
  }
  async getOrderById(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (result.length === 0) return void 0;
    const items = await db.select().from(orderItems).innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(eq(orderItems.orderId, id));
    const restaurant = await this.getRestaurantById(result[0].restaurantId);
    const customer = await this.getUser(result[0].customerId);
    let driver;
    if (result[0].driverId) {
      driver = await this.getDriver(result[0].driverId);
    }
    return {
      ...result[0],
      items: items.map((item) => ({
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
  async createOrder(orderData, orderItemsData) {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
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
  async updateOrderStatus(id, status, driverId) {
    return await db.transaction(async (tx) => {
      const updateData = {
        status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (driverId) {
        updateData.driverId = driverId;
      }
      const [order] = await tx.update(orders).set(updateData).where(eq(orders.id, id)).returning();
      return order;
    });
  }
  // Restaurant categories and promotions
  async getCategories() {
    return await db.select().from(restaurantCategories).orderBy(asc(restaurantCategories.name));
  }
  async getPromotions() {
    return await db.select().from(promotions).where(
      and(
        eq(promotions.isActive, true),
        gte(promotions.endDate, /* @__PURE__ */ new Date()),
        lte(promotions.startDate, /* @__PURE__ */ new Date())
      )
    ).orderBy(desc(promotions.startDate));
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  try {
    if (!stored.includes(".")) {
      return supplied === stored;
    }
    const parts = stored.split(".");
    if (parts.length !== 2) {
      return supplied === stored;
    }
    const [hashed, salt] = parts;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return supplied === stored;
  }
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "papua-eats-secret-session-key",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3,
      path: "/",
      sameSite: "lax"
    }
  };
  if (process.env.VERCEL === "1") {
    console.log("Using memory store for Vercel deployment");
  } else if (storage.sessionStore) {
    console.log("Using database session store for development");
    sessionSettings.store = storage.sessionStore;
  }
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Login attempt for user:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "Invalid username or password" });
        }
        console.log("User found, verifying password...");
        const passwordMatch = await comparePasswords(password, user.password);
        if (passwordMatch) {
          console.log("Password verified successfully for:", username);
          return done(null, user);
        } else {
          console.log("Password verification failed for:", username);
          return done(null, false, { message: "Invalid username or password" });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword
      };
      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  const apiPrefix = "/api";
  app2.get(`${apiPrefix}/restaurants/admin`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    try {
      const restaurants2 = await storage.getRestaurants({});
      res.json(restaurants2);
    } catch (error) {
      console.error("Error fetching restaurants for admin:", error);
      res.status(500).json({ message: "Failed to fetch restaurants for admin" });
    }
  });
  app2.get(`${apiPrefix}/restaurants`, async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      const search = req.query.search;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const restaurants2 = await storage.getRestaurants({ categoryId, search, limit, offset });
      res.json(restaurants2);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });
  app2.get(`${apiPrefix}/restaurants/:id`, async (req, res) => {
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
  app2.post(`${apiPrefix}/restaurants`, async (req, res) => {
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
  app2.put(`${apiPrefix}/restaurants/:id`, async (req, res) => {
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
  app2.get(`${apiPrefix}/restaurants/:id/menu-categories`, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categories = await storage.getMenuCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching menu categories:", error);
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });
  app2.get(`${apiPrefix}/restaurants/:id/menu-items`, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      const menuItems2 = await storage.getMenuItems(restaurantId, categoryId);
      res.json(menuItems2);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get(`${apiPrefix}/menu-items`, async (req, res) => {
    try {
      const menuItems2 = await storage.getMenuItems();
      res.json(menuItems2);
    } catch (error) {
      console.error("Error fetching all menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.post(`${apiPrefix}/menu-items`, async (req, res) => {
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
  app2.put(`${apiPrefix}/menu-items/:id`, async (req, res) => {
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
  app2.delete(`${apiPrefix}/menu-items/:id`, async (req, res) => {
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
  app2.get(`${apiPrefix}/orders`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const options = {};
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
      if (req.query.restaurantId) {
        options.restaurantId = parseInt(req.query.restaurantId);
      }
      if (req.query.status) {
        options.status = req.query.status;
      }
      const orders2 = await storage.getOrders(options);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (req.user.role !== "admin" && order.customerId !== req.user.id && !(req.user.role === "driver" && order.driverId === req.user.id)) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.post(`${apiPrefix}/orders`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders" });
    }
    try {
      const { orderData, orderItems: orderItems2 } = req.body;
      orderData.customerId = req.user.id;
      const order = await storage.createOrder(orderData, orderItems2);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.put(`${apiPrefix}/orders/:id/status`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status, driverId } = req.body;
      const currentOrder = await storage.getOrderById(id);
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isAdmin = req.user.role === "admin";
      const isRestaurantOwner = req.user.id === currentOrder.restaurant.ownerId;
      const isAssignedDriver = req.user.role === "driver" && currentOrder.driverId === req.user.id;
      const isCustomer = req.user.id === currentOrder.customerId && status === "cancelled";
      if (!isAdmin && !isRestaurantOwner && !isAssignedDriver && !isCustomer) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
      const updatedOrder = await storage.updateOrderStatus(id, status, driverId);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get(`${apiPrefix}/drivers`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    try {
      const driversWithUsers = await storage.getAllDriversWithUsers();
      res.json(driversWithUsers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });
  app2.put(`${apiPrefix}/drivers/location`, async (req, res) => {
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
  app2.put(`${apiPrefix}/drivers/availability`, async (req, res) => {
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
  app2.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get(`${apiPrefix}/promotions`, async (req, res) => {
    try {
      const promotions2 = await storage.getPromotions();
      res.json(promotions2);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });
  app2.get(`${apiPrefix}/search/restaurants`, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const searchTerm = `%${q}%`;
      const results = await storage.getRestaurants({
        search: searchTerm,
        limit: 10
      });
      const formattedResults = results.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        imageUrl: restaurant.imageUrl,
        rating: restaurant.rating,
        categories: restaurant.categories?.map((cat) => cat.name) || [],
        isOpen: true,
        // This would ideally check operating hours
        distance: (Math.random() * 5 + 0.5).toFixed(1),
        // Placeholder for distance calculation
        deliveryTime: `${20 + Math.floor(Math.random() * 25)} min`
        // Placeholder for delivery estimate
      }));
      res.json({ results: formattedResults });
    } catch (error) {
      console.error("Error searching restaurants:", error);
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });
  app2.get(`${apiPrefix}/search/menuItems`, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const searchTerm = `%${q}%`;
      const menuItems2 = await storage.getMenuItems(void 0, void 0, searchTerm);
      const menuItemsWithDetails = await Promise.all(
        menuItems2.map(async (item) => {
          let restaurant = null;
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
  app2.get(`${apiPrefix}/drivers/earnings`, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "driver") {
      return res.status(403).json({ message: "Not authorized" });
    }
    try {
      const driver = await storage.getDriverByUserId(req.user.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      const options = {
        driverId: driver.id,
        status: "delivered"
      };
      const completedOrders = await storage.getOrders(options);
      const totalEarnings = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.deliveryFee || "0");
      }, 0);
      const now = /* @__PURE__ */ new Date();
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(now.getDate() - i);
        const amount = Math.round((Math.random() * 50 + 20) * 100) / 100;
        dailyData.push({
          date: date.toISOString().split("T")[0],
          amount
        });
      }
      const weeklyTotal = dailyData.reduce((sum, day) => sum + day.amount, 0);
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
          percentChange: 5.2
          // Mock percentage change
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/images", express2.static(path3.join(process.cwd(), "client/public/images")));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Server error: ${message} at ${req.method} ${req.path}`, err);
    const used = process.memoryUsage();
    console.error("Memory usage:", {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(used.external / 1024 / 1024)} MB`
    });
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
