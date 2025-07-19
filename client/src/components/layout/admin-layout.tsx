import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Menu, Search, Bell } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

type AdminLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { title: "Dashboard", path: "/admin/dashboard", icon: "fas fa-tachometer-alt" },
    { title: "Restaurants", path: "/admin/restaurants", icon: "fas fa-store" },
    { title: "Menu Items", path: "/admin/menu-items", icon: "fas fa-utensils" },
    { title: "Orders", path: "/admin/orders", icon: "fas fa-receipt" },
    { title: "Drivers", path: "/admin/drivers", icon: "fas fa-motorcycle" },
    { title: "Customers", path: "/admin/customers", icon: "fas fa-users" },
    { title: "Analytics", path: "/admin/analytics", icon: "fas fa-chart-bar" },
    { title: "Settings", path: "/admin/settings", icon: "fas fa-cog" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-neutral-800 to-neutral-900 text-white z-40 transition-transform duration-200",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="p-4 border-b border-neutral-700">
          <Logo variant="white" size="md" />
          <p className="text-sm text-neutral-400 mt-2">Admin Portal</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    location === item.path 
                      ? "bg-neutral-700 text-white" 
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  }`}>
                    <i className={`${item.icon} w-5 text-center`}></i>
                    <span>{item.title}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-300 hover:text-white hover:bg-neutral-700"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt w-5 text-center mr-3"></i>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-200",
        !isMobile && "ml-64"
      )}>
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-neutral-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                {user?.avatar && <AvatarImage src={user.avatar} />}
              </Avatar>
              <div className="hidden md:block">
                <h3 className="text-sm font-medium">{user?.fullName}</h3>
                <p className="text-xs text-neutral-500">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
