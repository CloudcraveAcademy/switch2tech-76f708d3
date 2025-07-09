
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const initializationStarted = useRef(false);
  const authListenerSet = useRef(false);
  
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

  // Single initialization effect that runs only once
  useEffect(() => {
    let isMounted = true;
    
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.log("Session error during initialization:", error);
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log("Valid session found during initialization");
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            if (isMounted) {
              setUser(enrichedUser);
            }
          } catch (profileError) {
            console.log("Profile enrichment failed, using basic user data:", profileError);
            if (isMounted) {
              setUser({
                ...currentSession.user,
                role: 'student'
              } as any);
            }
          }
        } else {
          console.log("No session found during initialization");
          setUser(null);
          setSession(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [enrichUserWithProfile, setUser, setSession]);

  // Separate effect for auth state listener
  useEffect(() => {
    if (authListenerSet.current || !initializationStarted.current) return;
    
    console.log("Setting up auth state listener");
    authListenerSet.current = true;
    
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
            // Use setTimeout to prevent blocking the auth state change
            setTimeout(async () => {
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
            }, 0);
          }
        }
      }
    );
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
      authListenerSet.current = false;
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
