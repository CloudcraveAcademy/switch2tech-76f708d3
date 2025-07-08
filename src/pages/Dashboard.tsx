
import { useEffect, useState } from "react";
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
  
  // Handle authentication and redirection
  useEffect(() => {
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { 
        replace: true,
        state: { from: location.pathname } 
      });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while auth is being determined
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

  // If not authenticated after loading, show redirecting message
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-2">Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render dashboard for authenticated users
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
      
      <main className="flex-1 overflow-y-auto bg-gray-100 pt-16 md:pt-0">
        <DashboardRoutes />
      </main>
    </div>
  );
};

export default Dashboard;
