
import React, { createContext, useContext, useRef, useState, useMemo, useEffect } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { AuthContextType, UserRole } from "@/types/auth";
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

  // Create dummy functions for login and register to satisfy the AuthContextType interface
  const login = async (email: string, password: string) => {
    // This should be handled by the auth provider or login components directly
    throw new Error("Login should be handled by Login component");
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // This should be handled by the auth provider or register components directly
    throw new Error("Register should be handled by Register component");
  };

  const setLoading = (loading: boolean) => {
    // This is handled internally by the auth provider
    console.log("setLoading called:", loading);
  };

  const validateSession = async () => {
    // This is handled internally by the auth provider
    return authState.user !== null;
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    setLoading,
    validateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole, UserWithProfile } from "@/types/auth";
