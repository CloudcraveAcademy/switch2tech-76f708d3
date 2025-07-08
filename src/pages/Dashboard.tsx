
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import DashboardRoutes from "@/components/dashboard/DashboardRoutes";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const redirectAttempted = useRef(false);

  // Simple redirect logic - only redirect if no user after loading completes
  useEffect(() => {
    if (!loading && !user && !redirectAttempted.current) {
      console.log("Dashboard: No user found after loading, redirecting to login");
      redirectAttempted.current = true;
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // Reset redirect flag when location changes
  useEffect(() => {
    redirectAttempted.current = false;
  }, [location.pathname]);

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Show message if no user (shouldn't happen due to redirect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <p className="text-center">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  // Redirect users without roles
  if (user && !user.role) {
    console.log("User has no role, redirecting to home");
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <DashboardMobileNav 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <DashboardMobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 pt-16 md:pt-0">
        <DashboardRoutes />
      </main>
    </div>
  );
};

export default Dashboard;
