
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  BarChart3,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

interface InstructorNavigationProps {
  isActive: (path: string) => boolean;
}

const InstructorNavigation = ({ isActive }: InstructorNavigationProps) => {
  const navItems = [
    { icon: BookOpen, label: "My Courses", path: "/dashboard" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: HelpCircle, label: "Support", path: "/dashboard/support" },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={cn(
            "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
            isActive(item.path)
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <item.icon
            className={cn(
              "mr-3 h-5 w-5 flex-shrink-0",
              isActive(item.path)
                ? "text-gray-300"
                : "text-gray-400 group-hover:text-gray-500"
            )}
          />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default InstructorNavigation;
