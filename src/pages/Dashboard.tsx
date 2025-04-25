
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
  const { user, loading, validateSession } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Only run validation if we don't already have a user and we're not already loading auth state
    if (!user && !loading && !isValidating) {
      console.log("Dashboard validating session - user not found");
      const validateAuthAndRedirect = async () => {
        setIsValidating(true);
        try {
          const isValid = await validateSession();
          
          if (!isValid) {
            console.log("Session invalid, redirecting to login");
            navigate("/login", { 
              replace: true,
              state: { from: location.pathname } 
            });
            return;
          }
          
        } finally {
          setIsValidating(false);
        }
      };
      
      validateAuthAndRedirect();
    } else if (user && !user.role) {
      // If user exists but has no role, redirect to home
      console.log("User has no role, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, location.pathname, validateSession, isValidating]);

  // Show loading state while checking authentication
  if (loading || isValidating) {
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

  // If we're not loading and there's no user, the effect will handle the redirect
  if (!user) {
    return null;
  }

  console.log("Dashboard rendering with user:", user.name, "role:", user.role);
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
