import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import SplashScreen from "@/pages/splash-screen";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerSearch from "@/pages/customer/search";
import RestaurantDetails from "@/pages/customer/restaurant-details";
import Cart from "@/pages/customer/cart";
import CustomerOrders from "@/pages/customer/orders";
import CustomerProfile from "@/pages/customer/profile";

// Driver Pages
import DriverDashboard from "@/pages/driver/dashboard";
import OrderDetails from "@/pages/driver/order-details";
import DriverHistory from "@/pages/driver/history";
import DriverEarnings from "@/pages/driver/earnings";
import DriverProfile from "@/pages/driver/profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import RestaurantsAdmin from "@/pages/admin/restaurants";
import MenuItemsAdmin from "@/pages/admin/menu-items";
import OrdersAdmin from "@/pages/admin/orders";
import DriversAdmin from "@/pages/admin/drivers";
import CustomersAdmin from "@/pages/admin/customers";
import AnalyticsAdmin from "@/pages/admin/analytics";
import SettingsAdmin from "@/pages/admin/settings";
import AdminHelp from "@/pages/admin/help";
import AdminProfile from "@/pages/admin/profile";

// Import the admin auth page
import AdminAuth from "@/pages/admin-auth";

function Router() {
  return (
    <Switch>
      {/* Splash screen as the initial route */}
      <Route path="/" component={SplashScreen} />
      
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Portal - Separate Entry Point */}
      <Route path="/admin" component={AdminAuth} />
      
      {/* Protected routes - Main home page after login */}
      <ProtectedRoute path="/home" component={HomePage} />
      
      {/* Customer routes */}
      <ProtectedRoute path="/customer/dashboard" component={CustomerDashboard} />
      <ProtectedRoute path="/customer/search" component={CustomerSearch} />
      <ProtectedRoute path="/customer/restaurant/:id" component={RestaurantDetails} />
      <ProtectedRoute path="/customer/cart" component={Cart} />
      <ProtectedRoute path="/customer/orders" component={CustomerOrders} />
      <ProtectedRoute path="/customer/profile" component={CustomerProfile} />
      
      {/* Driver routes */}
      <ProtectedRoute path="/driver/dashboard" component={DriverDashboard} />
      <ProtectedRoute path="/driver/order/:id" component={OrderDetails} />
      <ProtectedRoute path="/driver/history" component={DriverHistory} />
      <ProtectedRoute path="/driver/earnings" component={DriverEarnings} />
      <ProtectedRoute path="/driver/profile" component={DriverProfile} />
      
      {/* Admin Dashboard routes - Accessible after login */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/restaurants" component={RestaurantsAdmin} />
      <ProtectedRoute path="/admin/menu-items" component={MenuItemsAdmin} />
      <ProtectedRoute path="/admin/orders" component={OrdersAdmin} />
      <ProtectedRoute path="/admin/drivers" component={DriversAdmin} />
      <ProtectedRoute path="/admin/customers" component={CustomersAdmin} />
      <ProtectedRoute path="/admin/analytics" component={AnalyticsAdmin} />
      <ProtectedRoute path="/admin/settings" component={SettingsAdmin} />
      <ProtectedRoute path="/admin/help" component={AdminHelp} />
      <ProtectedRoute path="/admin/profile" component={AdminProfile} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
