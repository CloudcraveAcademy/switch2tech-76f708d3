
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  
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
  } = useSessionManager();

  // Initialize auth state
  useEffect(() => {
    if (isInitialized.current) return;
    
    let mounted = true;
    console.log("Initializing auth provider");
    isInitialized.current = true;
    
    const initializeAuth = async () => {
      try {
        // Get current session first
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (currentSession) {
          console.log("Found existing session during initialization");
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            if (mounted) {
              setUser(enrichedUser);
            }
          } catch (error) {
            console.error("Error enriching user during init:", error);
            if (mounted) {
              setUser(currentSession.user as any);
            }
          }
        } else {
          console.log("No existing session found");
          setUser(null);
          setSession(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (!mounted) return;
        
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && newSession)) {
            setSession(newSession);
            
            if (newSession?.user) {
              try {
                const enrichedUser = await enrichUserWithProfile(newSession.user);
                console.log("User authenticated:", enrichedUser?.email);
                setUser(enrichedUser);
              } catch (error) {
                console.error("Error enriching user:", error);
                setUser(newSession.user as any);
              }
            }
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out, clearing state");
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          if (newSession?.user) {
            setUser(newSession.user as any);
          }
          setLoading(false);
        }
      }
    );

    // Initialize
    initializeAuth();
    
    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [enrichUserWithProfile, setUser, setSession]);

  const logout = useCallback(async () => {
    await performLogout();
    
    if (onLogout) {
      onLogout();
    }
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
