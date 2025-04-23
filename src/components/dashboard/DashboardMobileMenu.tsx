
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
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
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
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
              </Transition.Child>
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
            </Dialog.Panel>
          </Transition.Child>
          <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DashboardMobileMenu;
