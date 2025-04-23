
import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Book, 
  GraduationCap,
  User,
  Settings,
  Bell,
  Star,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import Profile from "@/components/dashboard/Profile";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const getInitialDashboard = () => {
    switch (user.role) {
      case "student":
        return <StudentDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "admin":
      case "super_admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
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
          
          {user.role === "student" && (
            <>
              <Link
                to="/dashboard/my-courses"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive("/dashboard/my-courses")
                    ? "text-brand-700 bg-brand-50 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Book className="w-5 h-5 mr-3" />
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
          
          {user.role === "instructor" && (
            <>
              <Link
                to="/dashboard/my-courses"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive("/dashboard/my-courses")
                    ? "text-brand-700 bg-brand-50 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Book className="w-5 h-5 mr-3" />
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
                <User className="w-5 h-5 mr-3" />
                Students
              </Link>
            </>
          )}
          
          {(user.role === "admin" || user.role === "super_admin") && (
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
                <Book className="w-5 h-5 mr-3" />
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

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Switch2Tech Academy" className="h-8 w-auto" />
          <span className="ml-2 text-lg font-bold text-brand-700">Switch2Tech</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 rounded-md text-gray-700 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-medium">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              
              {/* Role-specific mobile menu items */}
              {user.role === "student" && (
                <>
                  <Link
                    to="/dashboard/my-courses"
                    className={`flex items-center py-2 text-sm mb-1 ${
                      isActive("/dashboard/my-courses")
                        ? "text-brand-700 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <GraduationCap className="w-5 h-5 mr-3" />
                    Certificates
                  </Link>
                </>
              )}
              
              {user.role === "instructor" && (
                <>
                  <Link
                    to="/dashboard/my-courses"
                    className={`flex items-center py-2 text-sm mb-1 ${
                      isActive("/dashboard/my-courses")
                        ? "text-brand-700 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Students
                  </Link>
                </>
              )}
              
              {(user.role === "admin" || user.role === "super_admin") && (
                <>
                  <Link
                    to="/dashboard/users"
                    className={`flex items-center py-2 text-sm mb-1 ${
                      isActive("/dashboard/users")
                        ? "text-brand-700 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center py-2 mt-6 text-sm text-gray-700 w-full text-left"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={getInitialDashboard()} />
          <Route path="/profile" element={<Profile />} />
          {/* Student Routes */}
          {user.role === "student" && (
            <>
              <Route path="/my-courses" element={<div className="p-6"><h1 className="text-2xl font-bold">My Courses</h1></div>} />
              <Route path="/certificates" element={<div className="p-6"><h1 className="text-2xl font-bold">My Certificates</h1></div>} />
            </>
          )}
          {/* Instructor Routes */}
          {user.role === "instructor" && (
            <>
              <Route path="/my-courses" element={<div className="p-6"><h1 className="text-2xl font-bold">My Courses</h1></div>} />
              <Route path="/students" element={<div className="p-6"><h1 className="text-2xl font-bold">My Students</h1></div>} />
            </>
          )}
          {/* Admin Routes */}
          {(user.role === "admin" || user.role === "super_admin") && (
            <>
              <Route path="/users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1></div>} />
              <Route path="/courses" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Management</h1></div>} />
            </>
          )}
          {/* Common Routes */}
          <Route path="/notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1></div>} />
          <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>} />
          <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
