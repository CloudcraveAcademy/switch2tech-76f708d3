
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const initializationComplete = useRef(false);
  const authListenerActive = useRef(false);
  
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

  // Single, stable initialization effect
  useEffect(() => {
    let isMounted = true;
    
    if (initializationComplete.current) return;
    
    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization...");
        initializationComplete.current = true;
        
        // Get current session first
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.log("Session error during initialization:", error);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
          return;
        }
        
        if (currentSession) {
          console.log("Valid session found, enriching user profile");
          setSession(currentSession);
          
          try {
            const enrichedUser = await enrichUserWithProfile(currentSession.user);
            if (isMounted) {
              setUser(enrichedUser);
              console.log("User profile enriched successfully");
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
          if (isMounted) {
            setUser(null);
            setSession(null);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          console.log("Auth initialization completed");
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

  // Separate effect for auth state listener - only runs after initialization
  useEffect(() => {
    if (!initializationComplete.current || authListenerActive.current) return;
    
    console.log("Setting up auth state listener");
    authListenerActive.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        // Handle sign out or no session
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log("User signed out, clearing state");
          setUser(null);
          setSession(null);
          return;
        }
        
        // Handle sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("Processing sign in or token refresh");
          setSession(newSession);
          
          if (newSession?.user) {
            // Use setTimeout to prevent blocking the auth state change
            setTimeout(async () => {
              try {
                const enrichedUser = await enrichUserWithProfile(newSession.user);
                setUser(enrichedUser);
                console.log("User profile updated from auth state change");
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
      authListenerActive.current = false;
    };
  }, [enrichUserWithProfile, setUser, setSession]);

  const logout = useCallback(async () => {
    try {
      await performLogout();
      
      // Reset initialization state to allow fresh start
      initializationComplete.current = false;
      
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("Logout error:", error);
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
