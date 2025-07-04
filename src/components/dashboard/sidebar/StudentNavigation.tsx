
import React from "react";
import { BookOpen, GraduationCap, Calendar, Award, User } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";

interface StudentNavigationProps {
  isActive: (path: string) => boolean;
}

const StudentNavigation: React.FC<StudentNavigationProps> = ({ isActive }) => {
  return (
    <>
      <SidebarMenuItem
        to="/dashboard/courses"
        icon={BookOpen}
        label="My Courses"
        isActive={isActive("/dashboard/courses")}
      />
      
      <SidebarMenuItem
        to="/dashboard/schedule"
        icon={Calendar}
        label="Class Schedule"
        isActive={isActive("/dashboard/schedule")}
      />
      
      <SidebarMenuItem
        to="/dashboard/certificates"
        icon={Award}
        label="Certificates"
        isActive={isActive("/dashboard/certificates")}
      />
    </>
  );
};

export default StudentNavigation;
