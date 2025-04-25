
import React, { createContext, useContext } from "react";
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
    
    React.useEffect(() => {
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
  
  // We're removing the validation effect from here because each protected component
  // should handle its own auth validation. This prevents duplicate validation checks.

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
