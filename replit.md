# Nasi Go - Food Delivery Application

## Overview

Nasi Go is a comprehensive food delivery platform designed for Papua, Indonesia. It's a full-stack web application built with React and Express that can also be deployed as mobile apps using Capacitor. The system supports three user roles: customers who order food, drivers who deliver orders, and administrators who manage the platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile Support**: Capacitor for native iOS and Android app generation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with role-based access control

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Comprehensive relational design with users, restaurants, menu items, orders, and driver tracking
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication System
- Password hashing using Node.js crypto with scrypt
- Role-based authentication (customer, driver, admin)
- Session management with secure cookies
- Protected routes based on user roles

### User Management
- **Users Table**: Core user data with roles (customer/driver/admin)
- **User Profiles**: Extended profile information with location data
- **Drivers Table**: Driver-specific attributes like vehicle info and availability status

### Restaurant & Menu System
- Restaurant management with categorization
- Menu items with categories, pricing, and availability
- Image storage for restaurants and menu items
- Admin controls for restaurant and menu management

### Order Management
- Complete order lifecycle from creation to delivery
- Order items with customizations and pricing
- Order status tracking (pending, confirmed, preparing, ready, picked_up, delivered, cancelled)
- Driver assignment and tracking

### Real-time Features
- Driver location tracking
- Order status updates
- Availability management for drivers

## Data Flow

1. **Customer Journey**: Register/Login → Browse restaurants → Add items to cart → Place order → Track delivery
2. **Driver Journey**: Login → Set availability → Receive orders → Update location → Complete deliveries
3. **Admin Journey**: Login → Manage restaurants/menus → Monitor orders → Manage users → View analytics

### API Structure
- `/api/auth/*` - Authentication endpoints
- `/api/restaurants/*` - Restaurant and menu management
- `/api/orders/*` - Order management and tracking
- `/api/drivers/*` - Driver management and location updates
- `/api/admin/*` - Administrative functions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight routing
- **drizzle-orm**: Type-safe database queries

### Mobile Dependencies
- **@capacitor/core**: Core Capacitor functionality
- **@capacitor/cli**: Capacitor command-line tools
- **@capacitor/ios**: iOS platform support
- **@capacitor/android**: Android platform support

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migrations and schema management

## Deployment Strategy

### Web Deployment
- Built assets served statically from `dist/public`
- Server bundle built with esbuild for production
- Environment variables for database connection and session secrets
- Production build optimized for performance

### Mobile Deployment
- Capacitor configuration for native app generation
- Progressive Web App manifest for mobile optimization
- Native splash screen and app icons configured
- Build process: `npm run build` → `npx cap sync` → native platform builds

### Database Strategy
- PostgreSQL database provisioned through Neon
- Migrations managed through Drizzle Kit
- Seeding script for initial data setup
- Connection pooling for production scalability

### Security Considerations
- Secure session management with httpOnly cookies
- Password hashing with salt
- Role-based access control throughout the application
- HTTPS enforcement in production
- Secure headers and CORS configuration

The application is designed to be scalable, maintainable, and provides a solid foundation for a food delivery service with native mobile app capabilities.