
import React from 'react';
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarMenuItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarMenuItem = ({ to, icon: Icon, label, isActive, onClick }: SidebarMenuItemProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm ${
        isActive
          ? "text-sidebar-primary bg-sidebar-accent font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </Link>
  );
};

export default SidebarMenuItem;
