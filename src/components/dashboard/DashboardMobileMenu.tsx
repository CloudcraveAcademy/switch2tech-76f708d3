import React from 'react';
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
  Settings,
  Bell,
  LogOut,
  Users,
  BookPlus,
  CircleDollarSign,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  ClipboardList,
  Monitor,
  Award,
  PlusCircle,
  HeadphonesIcon,
  Star,
  Brain
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import Logo from "@/components/common/Logo";

type DashboardMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DashboardMobileMenu = ({ isOpen, onClose }: DashboardMobileMenuProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="md:hidden" />
      <DialogContent className="p-0 border-none sm:rounded-none bg-transparent max-w-full h-full md:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-sidebar pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4 h-16 border-b">
              <Logo />
            </div>
            <div className="mt-4 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                <Link
                  to="/dashboard"
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={onClose}
                >
                  <Home className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                  Dashboard
                </Link>

                {/* Student Routes */}
                {user?.role === "student" && (
                  <>
                    <Link
                      to="/dashboard/my-courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      My Courses
                    </Link>
                    <Link
                      to="/dashboard/class-schedule"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Calendar className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Class Schedule
                    </Link>
                    <Link
                      to="/dashboard/certificates"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <GraduationCap className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Certificates
                    </Link>
                  </>
                )}

                {/* Instructor Routes */}
                {user?.role === "instructor" && (
                  <>
                    <Link
                      to="/dashboard/my-courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      My Courses
                    </Link>
                    <Link
                      to="/dashboard/students"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Users className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      My Students
                    </Link>
                    <Link
                      to="/dashboard/live-classes"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Monitor className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Live Classes
                    </Link>
                    <Link
                      to="/dashboard/certificates"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Award className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Certificates
                    </Link>
                    <Link
                      to="/dashboard/revenue"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Revenue
                    </Link>
                    <Link
                      to="/dashboard/create-course"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <PlusCircle className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Create Course
                    </Link>
                    <Link
                      to="/dashboard/assignments"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Assignments
                    </Link>
                    <Link
                      to="/dashboard/quizzes"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <ClipboardList className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Quizzes
                    </Link>
                    <Link
                      to="/dashboard/discussions"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Discussions
                    </Link>
                  </>
                )}

                {/* Admin Routes */}
                {(user?.role === "admin" || user?.role === "super_admin") && (
                  <>
                    <Link
                      to="/dashboard/users"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Users className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Users
                    </Link>
                    <Link
                      to="/dashboard/courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Courses
                    </Link>
                    <Link
                      to="/dashboard/live-classes-overview"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Monitor className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Live Classes
                    </Link>
                    <Link
                      to="/dashboard/certificates"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Award className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Certificates
                    </Link>
                    <Link
                      to="/dashboard/finance"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Finance
                    </Link>
                    <Link
                      to="/dashboard/reports"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Reports
                    </Link>
                    <Link
                      to="/dashboard/support-tickets"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <HeadphonesIcon className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Support
                    </Link>
                    <Link
                      to="/dashboard/announcements"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Announcements
                    </Link>
                    <Link
                      to="/dashboard/system"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      System
                    </Link>
                    <Link
                      to="/dashboard/ratings"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Star className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Ratings
                    </Link>
                    <Link
                      to="/dashboard/assignments-overview"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <ClipboardList className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Assignments
                    </Link>
                    <Link
                      to="/dashboard/quizzes-overview"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <Brain className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Quizzes
                    </Link>
                    <Link
                      to="/dashboard/discussions-overview"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={onClose}
                    >
                      <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                      Discussions
                    </Link>
                  </>
                )}

                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={onClose}
                  >
                    <Bell className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                    Notifications
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={onClose}
                  >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
          <div className="w-14 flex-shrink-0" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardMobileMenu;
