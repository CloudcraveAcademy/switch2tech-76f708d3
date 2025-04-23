
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import DashboardRoutes from "@/components/dashboard/DashboardRoutes";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
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
