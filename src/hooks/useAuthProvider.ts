
import { useState, useEffect, useCallback } from "react";
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

  // Auth state management effect - refactored to avoid React hook issues
  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          // Use setTimeout to prevent potential Supabase deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const enrichedUser = await enrichUserWithProfile(newSession?.user ?? null);
              console.log("Enriched user data after sign in:", enrichedUser);
              if (mounted) {
                setUser(enrichedUser);
                setLoading(false);
              }
            } catch (error) {
              console.error("Error enriching user data:", error);
              if (mounted) {
                setLoading(false);
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          if (mounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        }
      }
    );

    // Then initialize session - with error handling
    const initialize = async () => {
      try {
        await initializeSession();
      } catch (error) {
        console.error("Failed to initialize session:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [initializeSession, enrichUserWithProfile, setUser, setSession]);

  const logout = useCallback(async () => {
    await performLogout(onLogout);
  }, [performLogout, onLogout]);

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
