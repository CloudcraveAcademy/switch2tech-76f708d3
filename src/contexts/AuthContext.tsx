
import React, { createContext, useContext, useEffect } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { AuthContextType } from "@/types/auth";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const requireAuth = (Component: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
    const { user, loading, validateSession } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
      const checkAuth = async () => {
        const isValid = await validateSession();
        if (!isValid && !loading) {
          navigate("/login", { replace: true });
        }
      };
      
      checkAuth();
    }, [navigate, loading, validateSession]);
    
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    return user ? <Component {...props} /> : null;
  };
  
  return AuthenticatedComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    console.log("Navigation after logout");
    navigate("/", { replace: true });
  };
  
  const auth = useAuthProvider(handleLogout);
  const { user, loading, validateSession } = auth;

  // Global auth validation effect that runs on page refresh and route changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Only validate on dashboard or protected routes
      if (location.pathname.startsWith('/dashboard')) {
        console.log("Validating auth for protected route:", location.pathname);
        const isValid = await validateSession();
        
        if (!isValid && !loading) {
          console.log("Auth validation failed, redirecting to login");
          navigate('/login', { 
            replace: true, 
            state: { from: location.pathname } 
          });
        }
      }
    };
    
    checkAuthStatus();
  }, [location.pathname, navigate, validateSession, loading]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
