
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
    
    setIsLoggingOut(true);
    try {
      await onLogout();
      // Don't need to manually navigate since the logout function now handles this
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      // Ensure the button is re-enabled even if logout fails
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
