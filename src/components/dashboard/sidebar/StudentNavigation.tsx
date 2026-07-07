
import React from 'react';
import { BookOpen, GraduationCap, Calendar, MessageSquare, Sparkles } from "lucide-react";
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
      <SidebarMenuItem
        to="/dashboard/share-story"
        icon={Sparkles}
        label="Share Your Story"
        isActive={isActive("/dashboard/share-story")}
      />
    </>
  );
};

export default StudentNavigation;
