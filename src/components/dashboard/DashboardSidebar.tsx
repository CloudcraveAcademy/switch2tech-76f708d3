
import { Link, useLocation } from "react-router-dom";
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

const DashboardSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Switch2Tech Academy" className="h-8 w-auto" />
          <span className="ml-2 text-lg font-bold text-brand-700">Switch2Tech</span>
        </Link>
      </div>
      
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main
        </div>
        
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-2 text-sm ${
            isActive("/dashboard")
              ? "text-brand-700 bg-brand-50 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </Link>
        
        {user?.role === "student" && (
          <>
            <Link
              to="/dashboard/my-courses"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/my-courses")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              My Courses
            </Link>
            
            <Link
              to="/dashboard/certificates"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/certificates")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <GraduationCap className="w-5 h-5 mr-3" />
              Certificates
            </Link>
          </>
        )}
        
        {user?.role === "instructor" && (
          <>
            <Link
              to="/dashboard/create-course"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/create-course")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookPlus className="w-5 h-5 mr-3" />
              Create Course
            </Link>
            
            <Link
              to="/dashboard/my-courses"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/my-courses")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              My Courses
            </Link>
            
            <Link
              to="/dashboard/students"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/students")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Students
            </Link>
            
            <Link
              to="/dashboard/revenue"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/revenue")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CircleDollarSign className="w-5 h-5 mr-3" />
              Revenue
            </Link>
          </>
        )}
        
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <>
            <Link
              to="/dashboard/users"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/users")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              Users
            </Link>
            
            <Link
              to="/dashboard/courses"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/dashboard/courses")
                  ? "text-brand-700 bg-brand-50 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              Courses
            </Link>
          </>
        )}
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Account
        </div>
        
        <Link
          to="/dashboard/profile"
          className={`flex items-center px-4 py-2 text-sm ${
            isActive("/dashboard/profile")
              ? "text-brand-700 bg-brand-50 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <User className="w-5 h-5 mr-3" />
          Profile
        </Link>
        
        <Link
          to="/dashboard/notifications"
          className={`flex items-center px-4 py-2 text-sm ${
            isActive("/dashboard/notifications")
              ? "text-brand-700 bg-brand-50 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </Link>
        
        <Link
          to="/dashboard/settings"
          className={`flex items-center px-4 py-2 text-sm ${
            isActive("/dashboard/settings")
              ? "text-brand-700 bg-brand-50 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Link>
        
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 mt-6 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
