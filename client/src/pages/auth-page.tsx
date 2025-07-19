import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { UserAuthForm } from "@/components/user-auth-form";
import { ChevronLeft } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect if the user is already logged in (after all hooks are called)
  if (!isLoading && user) {
    if (user.role === "customer") {
      return <Redirect to="/customer/dashboard" />;
    } else if (user.role === "driver") {
      return <Redirect to="/driver/dashboard" />;
    } else if (user.role === "admin") {
      return <Redirect to="/admin/dashboard" />;
    } else {
      return <Redirect to="/" />;
    }
  }

  return (
    <div className="min-h-screen bg-white pt-12 px-4 pb-20 flex flex-col md:flex-row">
      {/* Back to splash screen button */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center text-neutral-500 hover:text-primary">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <Logo size="xs" />
          </Button>
        </Link>
      </div>

      {/* Auth Form */}
      <div className="md:w-1/2 max-w-md mx-auto md:mx-0 md:pl-10 md:pr-6 flex flex-col justify-center">
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Welcome to <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nasi Go</span>
          </h1>
          <p className="text-neutral-600 mt-2">Local flavors, delivered to your door</p>
        </div>

        <UserAuthForm />
        
        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-neutral-500">
            For administrators, please use the{" "}
            <a 
              href="/admin" 
              className="text-primary hover:text-primary-dark hover:underline font-medium"
            >
              Admin Portal
            </a>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-primary to-secondary relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-10">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Discover Papua's Finest Cuisine</h2>
            <p className="mb-6">
              Nasi Go connects you with the best local restaurants across Papua, Indonesia. Enjoy the richness of Papuan cuisine delivered right to your doorstep.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">50+</div>
                <div className="text-sm">Local Restaurants</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">30min</div>
                <div className="text-sm">Average Delivery</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">4.8</div>
                <div className="text-sm">Customer Rating</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">200+</div>
                <div className="text-sm">Dishes to Choose</div>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Safe, secure, and contactless delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
