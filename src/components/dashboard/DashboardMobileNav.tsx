
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
  
  // Add a timestamp to avatar URL to prevent caching issues
  const avatarUrl = user?.avatar 
    ? `${user.avatar}?t=${new Date().getTime()}`
    : undefined;

  return (
    <div className="fixed top-0 left-0 right-0 z-10 md:hidden bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Logo />
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user?.name || "User avatar"} />
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
