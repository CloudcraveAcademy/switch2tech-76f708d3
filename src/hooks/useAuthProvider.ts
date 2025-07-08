
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

  // Simple initialization
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (currentSession?.user) {
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            if (mounted) {
              setUser(enrichedUser);
            }
          } catch (error) {
            console.error("Profile enrichment failed:", error);
            if (mounted) {
              setUser(currentSession.user);
            }
          }
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
        
        console.log("Auth state changed:", event);
        
        if (newSession?.user) {
          setSession(newSession);
          try {
            const enrichedUser = await enrichUserWithProfile(newSession.user);
            setUser(enrichedUser);
          } catch (error) {
            console.error("Profile enrichment failed:", error);
            setUser(newSession.user);
          }
        } else {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      }
    );

    initAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [enrichUserWithProfile]);

  const logout = useCallback(async () => {
    await performLogout();
    if (onLogout) {
      onLogout();
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
