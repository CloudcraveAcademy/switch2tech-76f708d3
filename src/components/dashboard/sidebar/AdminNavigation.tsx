
import React from 'react';
import { Users, BookOpen, DollarSign, FileText, HeadphonesIcon, MessageSquare, Settings, Award, Star } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface AdminNavigationProps {
  isActive: (path: string) => boolean;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ isActive }) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/users"
        icon={Users}
        label="Users"
        isActive={isActive("/dashboard/users")}
      />
      
      <SidebarMenuItem
        to="/dashboard/courses"
        icon={BookOpen}
        label="Courses"
        isActive={isActive("/dashboard/courses")}
      />
      
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={Award}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
      
      <SidebarMenuItem
        to="/dashboard/finance"
        icon={DollarSign}
        label="Finance"
        isActive={isActive("/dashboard/finance")}
      />
      
      <SidebarMenuItem
        to="/dashboard/reports"
        icon={FileText}
        label="Reports"
        isActive={isActive("/dashboard/reports")}
      />
      
      <SidebarMenuItem
        to="/dashboard/support-tickets"
        icon={HeadphonesIcon}
        label="Support"
        isActive={isActive("/dashboard/support-tickets")}
      />
      
      <SidebarMenuItem
        to="/dashboard/announcements"
        icon={MessageSquare}
        label="Announcements"
        isActive={isActive("/dashboard/announcements")}
      />
      
      <SidebarMenuItem
        to="/dashboard/system"
        icon={Settings}
        label="System"
        isActive={isActive("/dashboard/system")}
      />
      
      <SidebarMenuItem
        to="/dashboard/ratings"
        icon={Star}
        label="Ratings"
        isActive={isActive("/dashboard/ratings")}
      />
    </>
  );
};

export default AdminNavigation;
