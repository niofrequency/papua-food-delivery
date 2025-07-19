import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User tables - Core user data and authentication
export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  avatar: text("avatar"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  bio: text("bio"),
}, (table) => {
  return {
    userIdIdx: uniqueIndex("user_profiles_user_id_idx").on(table.userId),
  };
});

// Driver specific attributes
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleType: text("vehicle_type").notNull(),
  licensePlate: text("license_plate").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 6 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 6 }),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
}, (table) => {
  return {
    userIdIdx: uniqueIndex("drivers_user_id_idx").on(table.userId),
  };
});

// Restaurant related tables
export const restaurants = pgTable("restaurants", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const restaurantCategories = pgTable("restaurant_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
});

export const restaurantToCategories = pgTable("restaurant_to_categories", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  categoryId: integer("category_id").notNull().references(() => restaurantCategories.id),
}, (table) => {
  return {
    restaurantCategoryIdx: uniqueIndex("restaurant_category_idx").on(table.restaurantId, table.categoryId),
  };
});

// Menu related tables
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isAvailable: boolean("is_available").notNull().default(true),
  menuCategoryId: integer("menu_category_id").references(() => menuCategories.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
});

// Order related tables
export const orders = pgTable("orders", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status", { enum: ["pending", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Review tables
export const restaurantReviews = pgTable("restaurant_reviews", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const driverReviews = pgTable("driver_reviews", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promotions and special offers
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  image: text("image"),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  isActive: boolean("is_active").notNull().default(true),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  ownedRestaurants: many(restaurants),
  orders: many(orders, { relationName: "customerOrders" }),
  restaurantReviews: many(restaurantReviews),
  driverReviews: many(driverReviews),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  orders: many(orders),
  reviews: many(driverReviews),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  categories: many(restaurantToCategories),
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  orders: many(orders),
  reviews: many(restaurantReviews),
  promotions: many(promotions),
}));

export const restaurantCategoriesRelations = relations(restaurantCategories, ({ many }) => ({
  restaurants: many(restaurantToCategories),
}));

export const restaurantToCategoriesRelations = relations(restaurantToCategories, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantToCategories.restaurantId],
    references: [restaurants.id],
  }),
  category: one(restaurantCategories, {
    fields: [restaurantToCategories.categoryId],
    references: [restaurantCategories.id],
  }),
}));

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuCategories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  menuCategory: one(menuCategories, {
    fields: [menuItems.menuCategoryId],
    references: [menuCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  driver: one(drivers, {
    fields: [orders.driverId],
    references: [drivers.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  restaurantReview: many(restaurantReviews),
  driverReview: many(driverReviews),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const restaurantReviewsRelations = relations(restaurantReviews, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantReviews.restaurantId],
    references: [restaurants.id],
  }),
  customer: one(users, {
    fields: [restaurantReviews.customerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [restaurantReviews.orderId],
    references: [orders.id],
  }),
}));

export const driverReviewsRelations = relations(driverReviews, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverReviews.driverId],
    references: [drivers.id],
  }),
  customer: one(users, {
    fields: [driverReviews.customerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [driverReviews.orderId],
    references: [orders.id],
  }),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [promotions.restaurantId],
    references: [restaurants.id],
  }),
}));

// Create validation schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  role: (schema) => schema.refine((val) => ["customer", "driver", "admin"].includes(val), {
    message: "Role must be customer, driver, or admin",
  }),
});

export const insertRestaurantSchema = createInsertSchema(restaurants, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  address: (schema) => schema.min(5, "Address must be at least 5 characters"),
  phone: (schema) => schema.min(5, "Phone must be at least 5 characters"),
});

export const insertMenuItemSchema = createInsertSchema(menuItems, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  price: (schema) => schema.refine((val: string) => Number(val) > 0, {
    message: "Price must be greater than 0",
  }),
});

export const insertOrderSchema = createInsertSchema(orders, {
  deliveryAddress: (schema) => schema.min(5, "Delivery address must be at least 5 characters"),
  totalAmount: (schema) => schema.refine((val: any) => Number(val) >= 0, {
    message: "Total amount must be a positive number",
  }),
  deliveryFee: (schema) => schema.refine((val: any) => Number(val) >= 0, {
    message: "Delivery fee must be a positive number",
  }),
});

export const insertDriverSchema = createInsertSchema(drivers, {
  vehicleType: (schema) => schema.min(2, "Vehicle type must be at least 2 characters"),
  licensePlate: (schema) => schema.min(2, "License plate must be at least 2 characters"),
});

// Create select schemas for type safety in the frontend
export const selectUserSchema = createSelectSchema(users);
export const selectRestaurantSchema = createSelectSchema(restaurants);
export const selectMenuItemSchema = createSelectSchema(menuItems);
export const selectOrderSchema = createSelectSchema(orders);
export const selectDriverSchema = createSelectSchema(drivers);

// Export types
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Restaurant = z.infer<typeof selectRestaurantSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type MenuItem = z.infer<typeof selectMenuItemSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Driver = z.infer<typeof selectDriverSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
