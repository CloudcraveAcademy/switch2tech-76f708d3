
import React from 'react';
import { Book, Users, DollarSign, PlusCircle, Award, FileText, MessageSquare, ClipboardList, Monitor, Mail } from "lucide-react";
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
        to="/dashboard/live-classes"
        icon={Monitor}
        label="Live Classes"
        isActive={isActive("/dashboard/live-classes")}
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
        to="/dashboard/payouts"
        icon={DollarSign}
        label="Payouts"
        isActive={isActive("/dashboard/payouts")}
      />
      
      <SidebarMenuItem
        to="/dashboard/create-course"
        icon={PlusCircle}
        label="Create Course"
        isActive={isActive("/dashboard/create-course")}
      />
      
      <SidebarMenuItem
        to="/dashboard/assignments"
        icon={FileText}
        label="Assignments"
        isActive={isActive("/dashboard/assignments")}
      />
      
      <SidebarMenuItem
        to="/dashboard/quizzes"
        icon={ClipboardList}
        label="Quizzes"
        isActive={isActive("/dashboard/quizzes")}
      />
      
      <SidebarMenuItem
        to="/dashboard/discussions"
        icon={MessageSquare}
        label="Discussions"
        isActive={isActive("/dashboard/discussions")}
      />
      
      <SidebarMenuItem
        to="/dashboard/messages"
        icon={Mail}
        label="Messages"
        isActive={isActive("/dashboard/messages")}
      />
    </>
  );
};

export default InstructorNavigation;
