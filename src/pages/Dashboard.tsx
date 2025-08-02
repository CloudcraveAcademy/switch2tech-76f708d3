
import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    if (!loading && !user && !redirectAttempted.current) {
      console.log("Dashboard: No user found after loading, redirecting to login");
      redirectAttempted.current = true;
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    // Only reset redirect attempt if we're leaving the dashboard
    if (!location.pathname.startsWith('/dashboard')) {
      redirectAttempted.current = false;
    }
  }, [location.pathname]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <p className="text-center">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  if (user && !user.role) {
    console.log("User has no role, redirecting to home");
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <DashboardMobileNav 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <DashboardMobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto bg-background pt-16 md:pt-0 pl-4">
        <DashboardRoutes />
      </main>
    </div>
  );
};

export default Dashboard;
