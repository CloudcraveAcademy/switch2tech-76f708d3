
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { login, register, logout: performLogout } = useAuthOperations();
  const { enrichUserWithProfile } = useUserProfile();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (currentSession?.user && mounted) {
          console.log("Found existing session for user:", currentSession.user.id);
          setSession(currentSession);
          
          // Try to enrich user profile
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            if (mounted) {
              console.log("User profile enriched successfully");
              setUser(enrichedUser);
            }
          } catch (profileError) {
            console.error("Profile enrichment failed, using basic user:", profileError);
            if (mounted) {
              setUser(currentSession.user);
            }
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, newSession ? "with session" : "no session");
        
        if (event === 'SIGNED_OUT' || !newSession) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        if (newSession?.user) {
          setSession(newSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(newSession.user);
            setUser(enrichedUser);
            console.log("User authenticated and profile loaded:", enrichedUser.role);
          } catch (error) {
            console.error("Profile enrichment failed in auth listener:", error);
            setUser(newSession.user);
          }
        }
        
        setLoading(false);
      }
    );

    // Initialize
    initializeAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [enrichUserWithProfile]);

  const logout = useCallback(async () => {
    try {
      await performLogout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [performLogout, onLogout]);

  const validateSession = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return !!currentSession;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  }, []);

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
