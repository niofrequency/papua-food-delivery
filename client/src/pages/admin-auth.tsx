import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";

// Schema for admin login form
const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminAuth() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // If the user is already logged in and is an admin, redirect to admin dashboard
  if (user && user.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  }

  // If the user is logged in but not an admin, show an error
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              This portal is only accessible to administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500 mb-4">
              Your account does not have administrative privileges.
            </p>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Return to Main App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin login form
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: AdminLoginFormValues) {
    try {
      setError(null);
      await loginMutation.mutateAsync(data);
      
      // Check if the user is an admin after login
      if (loginMutation.data && loginMutation.data.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "This portal is only accessible to administrators.",
          variant: "destructive",
        });
        // Force logout
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      {/* Admin Portal Branding Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-foreground text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <Logo variant="white" size="lg" />
          <h1 className="text-4xl font-bold mt-8">Admin Portal</h1>
          <p className="text-lg mt-4 text-primary-50">
            Manage restaurants, orders, drivers, and customers from a centralized dashboard.
          </p>
          <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
            <p className="text-primary-50">
              This area is restricted to authorized administrators only. All actions are logged for security purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 md:hidden">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="text-red-500 text-sm mt-2">{error}</div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login to Admin Portal"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              onClick={() => window.location.href = "/"}
              className="text-sm text-neutral-500"
            >
              Return to Main App
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}