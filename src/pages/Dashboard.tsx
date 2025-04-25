
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import DashboardRoutes from "@/components/dashboard/DashboardRoutes";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  // Always call all hooks at the top level unconditionally
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, validateSession } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationAttemptedRef = useRef(false);
  
  // Memoize validation logic to ensure it's stable across renders
  const validateAuthAndRedirect = useCallback(async () => {
    if (validationAttemptedRef.current || loading) return;
    
    console.log("Dashboard validating session - user not found");
    setIsValidating(true);
    validationAttemptedRef.current = true;
    
    try {
      const isValid = await validateSession();
      
      if (!isValid) {
        console.log("Session invalid, redirecting to login");
        navigate("/login", { 
          replace: true,
          state: { from: location.pathname } 
        });
      }
    } finally {
      setIsValidating(false);
    }
  }, [navigate, location.pathname, validateSession, loading]);

  // Auth validation effect - no conditional hook calls
  useEffect(() => {
    // Only run validation if user is null and we're not loading
    if (!loading && !user && !validationAttemptedRef.current) {
      validateAuthAndRedirect();
    }
    
    // Handle redirect for users without roles - no early returns
    if (user && !user.role) {
      console.log("User has no role, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [user, loading, validateAuthAndRedirect, navigate]);

  // Single render path with conditional content
  return (
    <>
      {(loading || isValidating) ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-64">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-64">
            <p className="text-center">Please log in to access the dashboard</p>
          </div>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default Dashboard;
