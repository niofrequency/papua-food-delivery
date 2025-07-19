import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/ui/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DriverLayoutProps = {
  children: ReactNode;
};

export function DriverLayout({ children }: DriverLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAvailabilityToggle = async (status: boolean) => {
    setIsUpdating(true);
    try {
      await apiRequest("PUT", "/api/drivers/availability", { isAvailable: status });
      setIsOnline(status);
      toast({
        title: status ? "You are now online" : "You are now offline",
        description: status 
          ? "You can now receive delivery requests" 
          : "You won't receive any new delivery requests",
      });
    } catch (error) {
      toast({
        title: "Failed to update availability",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const navigationItems = [
    { title: "Orders", path: "/driver/dashboard", icon: "fas fa-motorcycle" },
    { title: "History", path: "/driver/history", icon: "fas fa-history" },
    { title: "Earnings", path: "/driver/earnings", icon: "fas fa-wallet" },
    { title: "Profile", path: "/driver/profile", icon: "fas fa-user" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-secondary py-4 px-4 sticky top-0 z-30">
        <div className="flex justify-between items-center">
          <div>
            <Logo variant="white" size="sm" />
          </div>
          <div className="flex items-center space-x-3">
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-white/20 hover:bg-white/30">
                  <Menu className="h-5 w-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="text-left">
                  <SheetTitle>Driver Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                    <Avatar>
                      <AvatarFallback>{user?.fullName?.charAt(0) || "D"}</AvatarFallback>
                      {user?.avatar && <AvatarImage src={user.avatar} />}
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6 pb-3 border-b">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success' : 'bg-neutral-400'} mr-2`}></div>
                      <Label htmlFor="availability-mode">Availability Status</Label>
                    </div>
                    <Switch
                      id="availability-mode"
                      checked={isOnline}
                      onCheckedChange={handleAvailabilityToggle}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link key={item.path} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                          location === item.path 
                            ? "bg-secondary/10 text-secondary" 
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}>
                          <i className={`${item.icon} w-5 text-center`} />
                          <span>{item.title}</span>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <i className="fas fa-sign-out-alt w-5 text-center mr-3" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 z-30">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => (
              <Link key={item.path} href={item.path} className={`flex flex-col items-center ${
                  location === item.path ? "text-secondary" : "text-neutral-500"
                }`}>
                  <i className={`${item.icon} text-xl`}></i>
                  <span className="text-xs mt-1">{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
