
import React from 'react';
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardMobileNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DashboardMobileNav = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: DashboardMobileNavProps) => {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-10 md:hidden bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Logo />
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.avatar || undefined} 
              alt={user?.name || "User avatar"}
              loading="lazy"
            />
            <AvatarFallback>
              {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMobileNav;
