
import React from 'react';
import { BookOpen, GraduationCap, Calendar, MessageSquare } from "lucide-react";
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
        to="/dashboard/class-schedule"
        icon={Calendar}
        label="Class Schedule"
        isActive={isActive("/dashboard/class-schedule")}
      />
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={GraduationCap}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
      <SidebarMenuItem
        to="/dashboard/messages"
        icon={MessageSquare}
        label="Messages"
        isActive={isActive("/dashboard/messages")}
      />
    </>
  );
};

export default StudentNavigation;
