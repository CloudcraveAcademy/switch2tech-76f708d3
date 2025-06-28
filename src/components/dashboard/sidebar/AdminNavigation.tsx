import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, GraduationCap, Users, Settings, Book, ListChecks, LayoutDashboard, MessageSquare, FileVideo, FileText, UserPlus, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import SuccessStoriesManager from "@/components/dashboard/admin/SuccessStoriesManager";

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ path, label, icon }) => {
  return (
    <li>
      <Link
        to={`/dashboard/${path}`}
        className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {icon}
        <span className="ml-3">{label}</span>
      </Link>
    </li>
  );
};

const AdminNavigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out failed:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const adminRoutes = [
    { path: "courses", component: null, label: "Courses" },
    { path: "lessons", component: null, label: "Lessons" },
    { path: "categories", component: null, label: "Categories" },
    { path: "users", component: null, label: "Users" },
    { path: "announcements", component: null, label: "Announcements" },
    { path: "assignments", component: null, label: "Assignments" },
    { path: "quizzes", component: null, label: "Quizzes" },
    { path: "success-stories", component: SuccessStoriesManager, label: "Success Stories" },
  ];

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-gray-50 dark:bg-gray-800">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Home className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Homepage</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/courses"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <GraduationCap className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Courses</span>
            </Link>
          </li>
          <li>
            <Link
              to="/lessons"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Book className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Lessons</span>
            </Link>
          </li>
          <li>
            <Link
              to="/assignments"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ListChecks className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Assignments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/quizzes"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FileText className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Quizzes</span>
            </Link>
          </li>
          <li>
            <Link
              to="/announcements"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MessageSquare className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Announcements</span>
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Users className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Users</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/create-instructor"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <UserPlus className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Create Instructor</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/manage-instructors"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <UserCog className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Manage Instructors</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/payment-settings"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Payment Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={handleSignOut}
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <svg
                aria-hidden="true"
                className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm7.707 3.293a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-3">Sign Out</span>
            </button>
          </li>
        </ul>
        <ul className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
          <li>
            <h3 className="flex items-center p-2 text-sm font-semibold text-gray-900 rounded-lg dark:text-white">
              Admin Tools
            </h3>
          </li>
          {adminRoutes.map((route) => (
            <NavItem
              key={route.path}
              path={`admin/${route.path}`}
              label={route.label}
              icon={<Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default AdminNavigation;
