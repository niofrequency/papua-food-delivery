import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth";

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Check if there are any existing users
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      console.log("No existing users found, creating default users...");
      
      // Create default admin user
      const adminPassword = await hashPassword("admin123");
      const [admin] = await db.insert(schema.users).values({
        username: "admin",
        password: adminPassword,
        email: "admin@nasigo.com",
        fullName: "Nasi Go Admin",
        role: "admin",
        phone: "123-456-7890",
        address: "Admin Office, Papua",
      }).returning();
      console.log("Created admin user:", admin.username);
      
      // Create default customer user
      const customerPassword = await hashPassword("customer123");
      const [customer] = await db.insert(schema.users).values({
        username: "customer",
        password: customerPassword,
        email: "customer@example.com",
        fullName: "Sample Customer",
        role: "customer",
        phone: "123-456-7891",
        address: "123 Main St, Papua",
      }).returning();
      console.log("Created customer user:", customer.username);
      
      // Create default driver user
      const driverPassword = await hashPassword("driver123");
      const [driver] = await db.insert(schema.users).values({
        username: "driver",
        password: driverPassword,
        email: "driver@example.com",
        fullName: "Sample Driver",
        role: "driver",
        phone: "123-456-7892",
        address: "456 Delivery Ave, Papua",
      }).returning();
      console.log("Created driver user:", driver.username);
      
      // Create driver profile for the driver user
      await db.insert(schema.drivers).values({
        userId: driver.id,
        vehicleType: "Motorcycle",
        licensePlate: "DR-1234",
        isAvailable: true,
      });
      console.log("Created driver profile for:", driver.username);
      
      // Create restaurant categories
      const categories = [
        { name: "Indonesian", description: "Traditional Indonesian cuisine", icon: "🍚" },
        { name: "Seafood", description: "Fresh seafood from Papua", icon: "🦞" },
        { name: "Fast Food", description: "Quick and convenient meals", icon: "🍔" },
        { name: "Desserts", description: "Sweet treats and desserts", icon: "🧁" },
      ];
      
      const insertedCategories = await db.insert(schema.restaurantCategories)
        .values(categories)
        .returning();
      console.log(`Created ${insertedCategories.length} restaurant categories`);
    } else {
      console.log(`Found ${existingUsers.length} existing users, skipping user creation.`);
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
