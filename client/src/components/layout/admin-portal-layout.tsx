import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Bell, Menu, Search, LayoutDashboard, Store, ShoppingBag, Bike, Users, BarChart2, Settings, HelpCircle, LogOut, Utensils } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type AdminPortalLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AdminPortalLayout({ children, title = "Dashboard" }: AdminPortalLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { title: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Restaurants", path: "/admin/restaurants", icon: <Store className="h-5 w-5" /> },
    { title: "Menu Items", path: "/admin/menu-items", icon: <Utensils className="h-5 w-5" /> },
    { title: "Orders", path: "/admin/orders", icon: <ShoppingBag className="h-5 w-5" /> },
    { title: "Drivers", path: "/admin/drivers", icon: <Bike className="h-5 w-5" /> },
    { title: "Customers", path: "/admin/customers", icon: <Users className="h-5 w-5" /> },
    { title: "Analytics", path: "/admin/analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 w-64 h-screen bg-white border-r border-neutral-200 z-40 transition-transform duration-200 flex flex-col",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Fixed Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-center flex-shrink-0">
          <Logo size="sm" />
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6 bg-neutral-100 p-3 rounded-lg">
              <Avatar>
                <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                {user?.avatar && <AvatarImage src={user.avatar} />}
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user?.fullName}</p>
                <p className="text-xs text-neutral-500">Administrator</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <nav>
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      location === item.path 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="p-4 border-t border-neutral-200 flex-shrink-0">
          <div className="mb-4">
            <Link href="/admin/help" className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-neutral-700 hover:bg-neutral-100">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Link>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-200",
        sidebarOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 py-3 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 h-9"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                    {user?.avatar && <AvatarImage src={user.avatar} />}
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">{user?.fullName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/admin/profile" className="flex items-center cursor-pointer w-full">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/admin/settings" className="flex items-center cursor-pointer w-full">
                    System Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/" className="flex items-center cursor-pointer w-full">
                    Go to Main App
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-700" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Nasi Go. All rights reserved.</p>
        </footer>
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