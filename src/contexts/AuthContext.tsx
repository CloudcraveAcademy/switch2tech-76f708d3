
import React, { createContext, useContext, useEffect } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { AuthContextType } from "@/types/auth";

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
    
    useEffect(() => {
      const checkAuth = async () => {
        const isValid = await validateSession();
        if (!isValid && !loading) {
          // Navigation is now handled by the AuthProvider
          window.location.href = "/login";
        }
      };
      
      checkAuth();
    }, [loading, validateSession]);
    
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    return user ? <Component {...props} /> : null;
  };
  
  return AuthenticatedComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pass handleLogout callback to useAuthProvider
  const handleLogout = () => {
    console.log("Navigation after logout");
    window.location.href = "/";
  };
  
  const auth = useAuthProvider(handleLogout);
  const { user, loading, validateSession } = auth;

  // Global auth validation effect
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Only validate on dashboard or protected routes
      if (window.location.pathname.startsWith('/dashboard')) {
        console.log("Validating auth for protected route:", window.location.pathname);
        const isValid = await validateSession();
        
        if (!isValid && !loading) {
          console.log("Auth validation failed, redirecting to login");
          // Use direct window location for redirect
          const currentPath = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?from=${currentPath}`;
        }
      }
    };
    
    checkAuthStatus();
  }, [validateSession, loading]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
