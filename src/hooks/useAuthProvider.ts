
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const authListenerInitialized = useRef(false);
  const initializationComplete = useRef(false);
  
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

  // Simplified auth state management effect
  useEffect(() => {
    if (authListenerInitialized.current) return;
    
    let mounted = true;
    console.log("Setting up auth state listener");
    authListenerInitialized.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (!mounted) return;
        
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && newSession)) {
            setSession(newSession);
            
            if (newSession?.user) {
              const enrichedUser = await enrichUserWithProfile(newSession.user);
              console.log("User authenticated:", enrichedUser?.email);
              setUser(enrichedUser);
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

    // Initialize session
    const initialize = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("Found existing session during initialization");
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            setUser(enrichedUser);
          } catch (error) {
            console.error("Error enriching user during init:", error);
            setUser(currentSession.user as any);
          }
        }
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
      authListenerInitialized.current = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [enrichUserWithProfile, setUser, setSession, setLoading]);

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
