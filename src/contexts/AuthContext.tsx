
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
  // Create a wrapped component that handles auth checking
  const AuthWrappedComponent = (props: any) => {
    const { user, loading } = useAuth();
    const authAttemptedRef = useRef(false);
    
    // Simple loading state
    if (loading && !authAttemptedRef.current) {
      authAttemptedRef.current = true;
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // Pass control to Dashboard which will handle validation
    return <Component {...props} />;
  };
  
  AuthWrappedComponent.displayName = `RequireAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthWrappedComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Prevent recreating the logout handler on every render
  const logoutHandlerRef = useRef((path?: string) => {
    console.log("Navigation after logout");
    window.location.href = path || "/";
  });
  
  // Create a stable instance of the auth provider
  const [authState] = useState(() => 
    useAuthProvider(logoutHandlerRef.current)
  );

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
