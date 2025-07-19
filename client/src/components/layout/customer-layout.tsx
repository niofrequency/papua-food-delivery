import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/ui/logo";

type CustomerLayoutProps = {
  children: ReactNode;
};

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { title: "Home", path: "/customer/dashboard", icon: "fas fa-home" },
    { title: "Search", path: "/customer/search", icon: "fas fa-search" },
    { title: "Orders", path: "/customer/orders", icon: "fas fa-receipt" },
    { title: "Profile", path: "/customer/profile", icon: "fas fa-user" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="flex items-center pl-3 border-l border-neutral-200">
              <MapPin className="text-primary mr-2 h-4 w-4" />
              <div>
                <h2 className="text-sm font-medium text-neutral-800">Deliver to</h2>
                <p className="text-xs text-neutral-500">{user?.address || "Set your address"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <Link href="/customer/orders">
                <Button variant="ghost" size="icon">
                  <i className="fas fa-receipt text-neutral-600"></i>
                </Button>
              </Link>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-neutral-600" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                    <Avatar>
                      <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                      {user?.avatar && <AvatarImage src={user.avatar} />}
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link key={item.path} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                          location === item.path 
                            ? "bg-primary/10 text-primary" 
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
                  location === item.path ? "text-primary" : "text-neutral-500"
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
