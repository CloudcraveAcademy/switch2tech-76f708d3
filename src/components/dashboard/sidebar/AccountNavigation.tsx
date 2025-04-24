
import React from 'react';
import { User, Bell, Settings, LogOut } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface AccountNavigationProps {
  isActive: (path: string) => boolean;
  onLogout: () => void;
}

const AccountNavigation = ({ isActive, onLogout }: AccountNavigationProps) => {
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
        onClick={onLogout}
        className="flex items-center px-4 py-2 mt-6 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </button>
    </>
  );
};

export default AccountNavigation;
