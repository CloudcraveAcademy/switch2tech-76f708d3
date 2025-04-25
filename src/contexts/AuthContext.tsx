
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
        // Don't validate if we already have a user
        if (user) return;
        
        const isValid = await validateSession();
        if (!isValid && !loading) {
          // Navigation is now handled by the AuthProvider
          window.location.href = "/login";
        }
      };
      
      if (!user && !loading) {
        checkAuth();
      }
    }, [user, loading, validateSession]);
    
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

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
