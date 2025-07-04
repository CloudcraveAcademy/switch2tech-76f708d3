
import React from "react";
import { BookOpen, Users, BarChart3, Calendar, FileText } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";

interface InstructorNavigationProps {
  isActive: (path: string) => boolean;
}

const InstructorNavigation: React.FC<InstructorNavigationProps> = ({ isActive }) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/courses"
        icon={BookOpen}
        label="My Courses"
        isActive={isActive("/dashboard/courses")}
      />
      
      <SidebarMenuItem
        to="/dashboard/students"
        icon={Users}
        label="My Students"
        isActive={isActive("/dashboard/students")}
      />
      
      <SidebarMenuItem
        to="/dashboard/analytics"
        icon={BarChart3}
        label="Analytics"
        isActive={isActive("/dashboard/analytics")}
      />
      
      <SidebarMenuItem
        to="/dashboard/schedule"
        icon={Calendar}
        label="Schedule"
        isActive={isActive("/dashboard/schedule")}
      />
      
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={FileText}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
    </>
  );
};

export default InstructorNavigation;
