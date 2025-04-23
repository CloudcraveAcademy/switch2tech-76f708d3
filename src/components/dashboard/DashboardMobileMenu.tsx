
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Book, 
  GraduationCap,
  User,
  Settings,
  Bell,
  LogOut,
  X 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardMobileMenu = ({ isOpen, onClose }: DashboardMobileMenuProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-medium">Menu</span>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 overflow-y-auto">
          <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </div>
          
          <Link
            to="/dashboard"
            className={`flex items-center py-2 text-sm mb-1 ${
              isActive("/dashboard")
                ? "text-brand-700 font-medium"
                : "text-gray-700"
            }`}
            onClick={onClose}
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          
          {user?.role === "student" && (
            <>
              <Link
                to="/dashboard/my-courses"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/my-courses")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <Book className="w-5 h-5 mr-3" />
                My Courses
              </Link>
              
              <Link
                to="/dashboard/certificates"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/certificates")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <GraduationCap className="w-5 h-5 mr-3" />
                Certificates
              </Link>
            </>
          )}
          
          {user?.role === "instructor" && (
            <>
              <Link
                to="/dashboard/my-courses"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/my-courses")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <Book className="w-5 h-5 mr-3" />
                My Courses
              </Link>
              
              <Link
                to="/dashboard/students"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/students")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <User className="w-5 h-5 mr-3" />
                Students
              </Link>
            </>
          )}
          
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <>
              <Link
                to="/dashboard/users"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/users")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <User className="w-5 h-5 mr-3" />
                Users
              </Link>
              
              <Link
                to="/dashboard/courses"
                className={`flex items-center py-2 text-sm mb-1 ${
                  isActive("/dashboard/courses")
                    ? "text-brand-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={onClose}
              >
                <Book className="w-5 h-5 mr-3" />
                Courses
              </Link>
            </>
          )}
          
          <div className="mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </div>
          
          <Link
            to="/dashboard/profile"
            className={`flex items-center py-2 text-sm mb-1 ${
              isActive("/dashboard/profile")
                ? "text-brand-700 font-medium"
                : "text-gray-700"
            }`}
            onClick={onClose}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          
          <Link
            to="/dashboard/notifications"
            className={`flex items-center py-2 text-sm mb-1 ${
              isActive("/dashboard/notifications")
                ? "text-brand-700 font-medium"
                : "text-gray-700"
            }`}
            onClick={onClose}
          >
            <Bell className="w-5 h-5 mr-3" />
            Notifications
          </Link>
          
          <Link
            to="/dashboard/settings"
            className={`flex items-center py-2 text-sm mb-1 ${
              isActive("/dashboard/settings")
                ? "text-brand-700 font-medium"
                : "text-gray-700"
            }`}
            onClick={onClose}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center py-2 mt-6 text-sm text-gray-700 w-full text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default DashboardMobileMenu;
