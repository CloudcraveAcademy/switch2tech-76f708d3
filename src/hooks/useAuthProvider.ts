
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const initializationStarted = useRef(false);
  const authListenerSet = useRef(false);
  const mountedRef = useRef(true);
  
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

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Single initialization effect that runs only once
  useEffect(() => {
    if (initializationStarted.current || authListenerSet.current) return;
    
    initializationStarted.current = true;
    authListenerSet.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mountedRef.current) return;
            
            console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
            
            if (event === 'SIGNED_OUT' || !newSession) {
              console.log("User signed out or no session, clearing state");
              setUser(null);
              setSession(null);
              if (mountedRef.current) {
                setLoading(false);
              }
              return;
            }
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              console.log("User signed in, token refreshed, or initial session");
              setSession(newSession);
              
              if (newSession?.user) {
                // Use setTimeout to prevent blocking the auth state change
                setTimeout(async () => {
                  if (!mountedRef.current) return;
                  
                  try {
                    const enrichedUser = await enrichUserWithProfile(newSession.user);
                    if (mountedRef.current) {
                      setUser(enrichedUser);
                      setLoading(false);
                    }
                  } catch (error) {
                    console.error("Error enriching user data:", error);
                    if (mountedRef.current) {
                      setUser({
                        ...newSession.user,
                        role: 'student'
                      } as any);
                      setLoading(false);
                    }
                  }
                }, 0);
              }
            }
          }
        );
        
        // THEN get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
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
            if (mountedRef.current) {
              setUser(enrichedUser);
              setLoading(false);
            }
          } catch (profileError) {
            console.log("Profile enrichment failed, using basic user data:", profileError);
            if (mountedRef.current) {
              setUser({
                ...currentSession.user,
                role: 'student'
              } as any);
              setLoading(false);
            }
          }
        } else {
          console.log("No session found during initialization");
          setUser(null);
          setSession(null);
          if (mountedRef.current) {
            setLoading(false);
          }
        }
        
        // Cleanup function
        return () => {
          console.log("Cleaning up auth subscription");
          subscription.unsubscribe();
          authListenerSet.current = false;
        };
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mountedRef.current) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
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
