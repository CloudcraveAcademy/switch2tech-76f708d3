
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import DashboardRoutes from "@/components/dashboard/DashboardRoutes";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log("Dashboard component - auth state:", { user, loading });
    // Only redirect if we're sure the user isn't logged in (not during initial loading)
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [user, navigate, loading]);

  // Show loading state while checking authentication
  if (loading) {
    console.log("Dashboard is in loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    console.log("Dashboard - no user, showing redirect message");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  console.log("Dashboard rendering with user:", user.name);
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
