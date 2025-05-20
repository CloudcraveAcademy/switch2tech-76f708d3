
import React from 'react';
import { BookPlus, BookOpen, Users, CircleDollarSign, GraduationCap } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface InstructorNavigationProps {
  isActive: (path: string) => boolean;
}

const InstructorNavigation = ({ isActive }: InstructorNavigationProps) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/create-course"
        icon={BookPlus}
        label="Create Course"
        isActive={isActive("/dashboard/create-course")}
      />
      <SidebarMenuItem
        to="/dashboard/my-courses"
        icon={BookOpen}
        label="My Courses"
        isActive={isActive("/dashboard/my-courses")}
      />
      <SidebarMenuItem
        to="/dashboard/students"
        icon={Users}
        label="Students"
        isActive={isActive("/dashboard/students")}
      />
      <SidebarMenuItem
        to="/dashboard/revenue"
        icon={CircleDollarSign}
        label="Revenue"
        isActive={isActive("/dashboard/revenue")}
      />
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={GraduationCap}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
    </>
  );
};

export default InstructorNavigation;
