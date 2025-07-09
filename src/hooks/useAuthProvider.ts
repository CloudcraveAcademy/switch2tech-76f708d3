
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

  // Single initialization effect
  useEffect(() => {
    if (initializationComplete.current) return;
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        initializationComplete.current = true;
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log("Session error during initialization:", error);
          setUser(null);
          setSession(null);
        } else if (currentSession) {
          console.log("Valid session found during initialization");
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            setUser(enrichedUser);
          } catch (profileError) {
            console.log("Profile enrichment failed, using basic user data:", profileError);
            setUser({
              ...currentSession.user,
              role: 'student'
            } as any);
          }
        } else {
          console.log("No session found during initialization");
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [enrichUserWithProfile, setUser, setSession]);

  // Single auth state listener effect
  useEffect(() => {
    if (authListenerInitialized.current || !initializationComplete.current) return;
    
    console.log("Setting up auth state listener");
    authListenerInitialized.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log("User signed out or no session, clearing state");
          setUser(null);
          setSession(null);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          setSession(newSession);
          
          if (newSession?.user) {
            try {
              const enrichedUser = await enrichUserWithProfile(newSession.user);
              setUser(enrichedUser);
            } catch (error) {
              console.error("Error enriching user data:", error);
              setUser({
                ...newSession.user,
                role: 'student'
              } as any);
            }
          }
        }
      }
    );
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
      authListenerInitialized.current = false;
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
