
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is an auth redirect with access_token in hash
    const handleAuthRedirect = async () => {
      if (location.hash && location.hash.includes('access_token=')) {
        try {
          // Extract the hash and process it with Supabase
          const { error } = await supabase.auth.setSession({
            access_token: new URLSearchParams(location.hash.substring(1)).get('access_token') || '',
            refresh_token: new URLSearchParams(location.hash.substring(1)).get('refresh_token') || '',
          });
          
          if (error) throw error;
          
          toast({
            title: "Authentication successful",
            description: "Your email has been verified successfully.",
          });
          
          // Redirect to dashboard after successful auth
          navigate('/dashboard');
          return;
        } catch (error: any) {
          console.error("Error processing auth redirect:", error);
          toast({
            title: "Authentication error",
            description: error.message || "There was a problem with authentication",
            variant: "destructive",
          });
        }
      } else {
        console.error(
          "404 Error: User attempted to access non-existent route:",
          location.pathname
        );
      }
    };
    
    handleAuthRedirect();
  }, [location.hash, location.pathname, navigate, toast]);

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

  // If we're handling an auth redirect, show a loading message
  if (location.hash && location.hash.includes('access_token=')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Processing Authentication</h1>
          <p className="text-gray-600 mb-6">Please wait while we verify your account...</p>
        </div>
      </div>
    );
  }

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
