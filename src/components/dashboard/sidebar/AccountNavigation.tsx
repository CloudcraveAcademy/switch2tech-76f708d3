
import React, { useState } from 'react';
import { User, Bell, Settings, LogOut } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AccountNavigationProps {
  isActive: (path: string) => boolean;
  onLogout: () => Promise<void>;
}

const AccountNavigation = ({ isActive, onLogout }: AccountNavigationProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // Perform the logout operation
      await onLogout();
      
      // Force navigation to login page after logout
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Use a short timeout to ensure UI updates before navigation
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
      // Reset the logging out state on error
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <SidebarMenuItem
        to="/dashboard/profile"
        icon={User}
        label="Profile"
        isActive={isActive("/dashboard/profile")}
      />
      <SidebarMenuItem
        to="/dashboard/notifications"
        icon={Bell}
        label="Notifications"
        isActive={isActive("/dashboard/notifications")}
      />
      <SidebarMenuItem
        to="/dashboard/settings"
        icon={Settings}
        label="Settings"
        isActive={isActive("/dashboard/settings")}
      />
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center px-4 py-2 mt-6 text-sm text-gray-700 w-full text-left hover:bg-gray-100 disabled:opacity-50"
      >
        <LogOut className="w-5 h-5 mr-3" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </>
  );
};

export default AccountNavigation;
