
import React, { createContext, useContext, useRef, useState, useMemo, useEffect } from "react";
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
  // Use a named function instead of anonymous to help with debugging
  function AuthWrappedComponent(props: any) {
    // Always call hooks at the top level - consistent across all renders
    const { user, loading } = useAuth();
    
    // Use a render-only approach without early returns
    return (
      <>
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="space-y-4 w-64">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : !user ? (
          <div className="flex justify-center items-center h-screen">
            <p className="text-center">Please log in to continue</p>
          </div>
        ) : (
          <Component {...props} />
        )}
      </>
    );
  }
  
  AuthWrappedComponent.displayName = `RequireAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthWrappedComponent;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the authState directly without passing any arguments
  const authState = useAuthProvider();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
