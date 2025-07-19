import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  // Redirect to the appropriate dashboard based on user role
  if (user) {
    if (user.role === "customer") {
      return <Redirect to="/customer/dashboard" />;
    } else if (user.role === "driver") {
      return <Redirect to="/driver/dashboard" />;
    } else if (user.role === "admin") {
      return <Redirect to="/admin/dashboard" />;
    }
  }

  // If not logged in, redirect to auth page
  return <Redirect to="/auth" />;
}
