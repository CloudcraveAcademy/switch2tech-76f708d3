
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import DashboardRoutes from "@/components/dashboard/DashboardRoutes";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  // Always call hooks at the top level
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, validateSession } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationAttemptedRef = useRef(false);
  const initialRenderRef = useRef(true);
  
  // Memoize validation logic
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

  // Auth validation effect
  useEffect(() => {
    if (!user && !loading && !validationAttemptedRef.current) {
      validateAuthAndRedirect();
    }
    
    // Handle redirect for users without roles
    if (user && !user.role) {
      console.log("User has no role, redirecting to home");
      navigate("/", { replace: true });
    }
    
    // Reset initial render flag
    initialRenderRef.current = false;
  }, [user, loading, validateAuthAndRedirect, navigate]);

  // Use a single return statement with conditional rendering
  return (
    <>
      {(loading && initialRenderRef.current) || isValidating ? (
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
            <Skeleton className="h-12 w-full" />
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
