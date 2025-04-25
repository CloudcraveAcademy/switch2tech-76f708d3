
import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { AuthContextType } from "@/types/auth";

// Create a context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const requireAuth = (Component: React.ComponentType<any>) => {
  // Memoize the authenticated component to prevent unnecessary re-renders
  const MemoizedAuthComponent = React.memo((props: any) => {
    const { user, loading } = useAuth();
    const authAttemptedRef = useRef(false);
    
    // Simple loading state - let Dashboard handle all validation logic
    if (loading && !authAttemptedRef.current) {
      authAttemptedRef.current = true;
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // Pass control to Dashboard which will handle validation
    return <Component {...props} />;
  });
  
  MemoizedAuthComponent.displayName = `RequireAuth(${Component.displayName || Component.name || 'Component'})`;
  return MemoizedAuthComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Prevent recreating the logout handler on every render
  const handleLogout = React.useCallback(() => {
    console.log("Navigation after logout");
    window.location.href = "/";
  }, []);
  
  // Store auth state in a singleton instance to prevent duplicate subscriptions
  const [authInstance] = useState(() => useAuthProvider(handleLogout));

  // Memoize children to prevent unnecessary re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);

  return (
    <AuthContext.Provider value={authInstance}>
      {memoizedChildren}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
