import { User, BookOpen, CircleDollarSign, Users, FileText, Bell, Shield, MessageSquare } from "lucide-react";
import SidebarMenuItem from './SidebarMenuItem';

interface AdminNavigationProps {
  isActive: (path: string) => boolean;
}

const AdminNavigation = ({ isActive }: AdminNavigationProps) => {
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
        to="/dashboard/finance"
        icon={CircleDollarSign}
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
        icon={MessageSquare}
        label="Support Tickets"
        isActive={isActive("/dashboard/support-tickets")}
      />
      <SidebarMenuItem
        to="/dashboard/announcements"
        icon={Bell}
        label="Announcements"
        isActive={isActive("/dashboard/announcements")}
      />
      <SidebarMenuItem
        to="/dashboard/system"
        icon={Shield}
        label="System"
        isActive={isActive("/dashboard/system")}
      />
    </>
  );
};

export default AdminNavigation;
