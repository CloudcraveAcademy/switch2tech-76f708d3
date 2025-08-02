
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/common/Logo";
import SidebarMenuItem from './sidebar/SidebarMenuItem';
import StudentNavigation from './sidebar/StudentNavigation';
import InstructorNavigation from './sidebar/InstructorNavigation';
import AdminNavigation from './sidebar/AdminNavigation';
import AccountNavigation from './sidebar/AccountNavigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DashboardSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar-background border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border bg-sidebar-background">
        <Logo />
      </div>
      
      {/* User profile section */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar-background flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={user?.avatar || undefined} 
            alt={user?.name || "User avatar"}
            loading="lazy"
          />
          <AvatarFallback>
            {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-sidebar-foreground">{user?.name || "User"}</span>
          <span className="text-xs text-sidebar-foreground/70 capitalize">{user?.role || "User"}</span>
        </div>
      </div>
      
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto bg-sidebar-background">
        <div className="px-4 mb-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
          Main
        </div>
        
        <SidebarMenuItem
          to="/dashboard"
          icon={Home}
          label="Dashboard"
          isActive={isActive("/dashboard")}
        />
        
        {user?.role === "student" && (
          <StudentNavigation isActive={isActive} />
        )}
        
        {user?.role === "instructor" && (
          <InstructorNavigation isActive={isActive} />
        )}
        
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <AdminNavigation isActive={isActive} />
        )}
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
          Account
        </div>
        
        <AccountNavigation isActive={isActive} onLogout={logout} />
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
