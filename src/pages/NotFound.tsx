
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Determine the most appropriate return path
  const getReturnPath = () => {
    if (location.pathname.includes('/dashboard')) {
      return '/dashboard';
    }
    if (location.pathname.includes('/courses')) {
      return '/courses';
    }
    return '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-6">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to={getReturnPath()}>
              {location.pathname.includes('/dashboard') 
                ? 'Return to Dashboard' 
                : 'Return to Home'}
            </Link>
          </Button>
          
          {user && location.pathname.includes('/dashboard/courses') && (
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard/my-courses">
                View My Courses
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
