
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const {
    login,
    register,
    logout: performLogout,
  } = useAuthOperations();
  
  const { enrichUserWithProfile } = useUserProfile();
  
  const {
    user,
    session,
    setUser,
    setSession,
    validateSession,
    initializeSession,
  } = useSessionManager();

  // Auth state management effect
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          // Use setTimeout to prevent potential Supabase deadlocks
          setTimeout(async () => {
            try {
              const enrichedUser = await enrichUserWithProfile(newSession?.user ?? null);
              console.log("Enriched user data after sign in:", enrichedUser);
              setUser(enrichedUser);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    // Then initialize session
    initializeSession().finally(() => setLoading(false));
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [initializeSession, enrichUserWithProfile]);

  const logout = async () => {
    await performLogout(onLogout);
  };

  return {
    user,
    session,
    login,
    register,
    logout,
    loading,
    setLoading,
    validateSession,
  };
};
