
import { Fragment } from "react";
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
  CircleDollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

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
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4">
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
              <img src="/logo.svg" alt="Switch2Tech" className="h-8 w-auto" />
              <span className="ml-2 text-lg font-bold text-brand-700">Switch2Tech</span>
            </div>
            <div className="mt-4 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                <Link
                  to="/dashboard"
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                >
                  <Home className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                  Dashboard
                </Link>

                {/* Student Routes */}
                {user?.role === "student" && (
                  <>
                    <Link
                      to="/dashboard/my-courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      My Courses
                    </Link>
                    <Link
                      to="/dashboard/certificates"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <GraduationCap className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Certificates
                    </Link>
                  </>
                )}

                {/* Instructor Routes */}
                {user?.role === "instructor" && (
                  <>
                    <Link
                      to="/dashboard/create-course"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <BookPlus className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Create Course
                    </Link>
                    <Link
                      to="/dashboard/my-courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      My Courses
                    </Link>
                    <Link
                      to="/dashboard/students"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <Users className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Students
                    </Link>
                    <Link
                      to="/dashboard/revenue"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <CircleDollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Revenue
                    </Link>
                  </>
                )}

                {/* Admin Routes */}
                {(user?.role === "admin" || user?.role === "super_admin") && (
                  <>
                    <Link
                      to="/dashboard/users"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <User className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Users
                    </Link>
                    <Link
                      to="/dashboard/courses"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                      Courses
                    </Link>
                  </>
                )}

                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Bell className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                    Notifications
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
          <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardMobileMenu;
