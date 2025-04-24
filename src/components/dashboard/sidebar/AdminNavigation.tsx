
import React from 'react';
import { User, BookOpen } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface AdminNavigationProps {
  isActive: (path: string) => boolean;
}

const AdminNavigation = ({ isActive }: AdminNavigationProps) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/users"
        icon={User}
        label="Users"
        isActive={isActive("/dashboard/users")}
      />
      <SidebarMenuItem
        to="/dashboard/courses"
        icon={BookOpen}
        label="Courses"
        isActive={isActive("/dashboard/courses")}
      />
    </>
  );
};

export default AdminNavigation;
