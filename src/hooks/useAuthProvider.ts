
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

  // Auth state management effect - stabilized to prevent loops
  useEffect(() => {
    if (authListenerInitialized.current) return;
    
    let mounted = true;
    console.log("Setting up auth state listener");
    authListenerInitialized.current = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (!mounted) return;
        
        // Prevent processing during initial load if we're already initialized
        if (initializationComplete.current && event === 'INITIAL_SESSION') {
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && newSession)) {
          setSession(newSession);
          
          // Use a more reliable approach for user enrichment
          if (newSession?.user) {
            try {
              const enrichedUser = await enrichUserWithProfile(newSession.user);
              console.log("Enriched user data:", enrichedUser);
              if (mounted) {
                setUser(enrichedUser);
                setLoading(false);
                initializationComplete.current = true;
              }
            } catch (error) {
              console.error("Error enriching user data:", error);
              if (mounted) {
                setUser(newSession.user as any); // Fallback to basic user
                setLoading(false);
                initializationComplete.current = true;
              }
            }
          } else if (mounted) {
            setLoading(false);
            initializationComplete.current = true;
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          if (mounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
            initializationComplete.current = false;
          }
        }
      }
    );

    // Initialize session only if not already done
    if (!initializationComplete.current) {
      const initialize = async () => {
        try {
          await initializeSession();
        } catch (error) {
          console.error("Failed to initialize session:", error);
        } finally {
          if (mounted && !initializationComplete.current) {
            setLoading(false);
            initializationComplete.current = true;
          }
        }
      };
      
      initialize();
    }
    
    return () => {
      mounted = false;
      authListenerInitialized.current = false;
      initializationComplete.current = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent loops

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
