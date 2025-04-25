
import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { AuthContextType } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

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
    
    // Always render something - don't use early returns that might break hook order
    if (loading) {
      return <div className="flex justify-center items-center h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>;
    }
    
    // Always render the component - the Dashboard component will handle redirects if needed
    return <Component {...props} />;
  };
  
  AuthWrappedComponent.displayName = `RequireAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthWrappedComponent;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a stable reference for the logout handler
  const logoutHandlerRef = useRef((path?: string) => {
    console.log("Navigation after logout");
    window.location.href = path || "/";
  });
  
  // Use useState with function initialization to create stable auth state
  const [authState] = useState(() => useAuthProvider(logoutHandlerRef.current));

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
