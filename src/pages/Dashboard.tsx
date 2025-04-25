
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
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuthAndRedirect = async () => {
      console.log("Dashboard component - validating auth state");
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
        
        // Session is valid but we need to check if user has the right role
        if (!user?.role) {
          console.log("User has no role or unauthorized role, redirecting to home");
          navigate("/", { replace: true });
          return;
        }
        
        console.log("Auth validation successful for role:", user.role);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuthAndRedirect();
  }, [user, navigate, location.pathname, validateSession]);

  // Show loading state while checking authentication
  if (loading || isValidating) {
    console.log("Dashboard is in loading/validating state");
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

  // If we're not loading and there's no user, the validateAuthAndRedirect function will handle the redirect
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
