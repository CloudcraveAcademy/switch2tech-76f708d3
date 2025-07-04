
import React from 'react';
import { BookOpen, GraduationCap } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface StudentNavigationProps {
  isActive: (path: string) => boolean;
}

const StudentNavigation = ({ isActive }: StudentNavigationProps) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/my-courses"
        icon={BookOpen}
        label="My Courses"
        isActive={isActive("/dashboard/my-courses")}
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

export default StudentNavigation;
