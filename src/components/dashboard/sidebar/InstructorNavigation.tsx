
import React from 'react';
import { Book, Users, DollarSign, PlusCircle, Award } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface InstructorNavigationProps {
  isActive: (path: string) => boolean;
}

const InstructorNavigation: React.FC<InstructorNavigationProps> = ({ isActive }) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/my-courses"
        icon={Book}
        label="My Courses"
        isActive={isActive("/dashboard/my-courses")}
      />
      
      <SidebarMenuItem
        to="/dashboard/students"
        icon={Users}
        label="My Students"
        isActive={isActive("/dashboard/students")}
      />
      
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={Award}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
      
      <SidebarMenuItem
        to="/dashboard/revenue"
        icon={DollarSign}
        label="Revenue"
        isActive={isActive("/dashboard/revenue")}
      />
      
      <SidebarMenuItem
        to="/dashboard/create-course"
        icon={PlusCircle}
        label="Create Course"
        isActive={isActive("/dashboard/create-course")}
      />
    </>
  );
};

export default InstructorNavigation;
