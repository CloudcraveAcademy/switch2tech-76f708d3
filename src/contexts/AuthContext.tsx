
import React, { createContext, useContext, useRef } from "react";
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
    const { user, loading } = useAuth();
    const authAttemptedRef = useRef(false);
    
    // Simple loading state - let Dashboard handle all validation logic
    if (loading && !authAttemptedRef.current) {
      authAttemptedRef.current = true;
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // Pass control to Dashboard which will handle validation
    return <Component {...props} />;
  };
  
  return AuthenticatedComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use a stable handler for logout that won't cause re-renders
  const handleLogout = () => {
    console.log("Navigation after logout");
    window.location.href = "/";
  };
  
  const auth = useAuthProvider(handleLogout);

  // Don't re-render children unnecessarily
  const memoizedChildren = React.useMemo(() => children, [children]);

  return (
    <AuthContext.Provider value={auth}>
      {memoizedChildren}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
