
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

  // Clear any stale auth data on initialization
  useEffect(() => {
    const clearStaleAuth = async () => {
      try {
        console.log("Checking for valid session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log("Session error, clearing auth:", error);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (!currentSession) {
          console.log("No valid session found, ensuring clean state");
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        // If we have a session, verify it's actually valid
        console.log("Validating existing session...");
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          console.log("Invalid session detected, clearing:", userError);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        // Session is valid, enrich with profile
        console.log("Valid session found, enriching user profile");
        try {
          const enrichedUser = await enrichUserWithProfile(currentUser);
          setSession(currentSession);
          setUser(enrichedUser);
        } catch (profileError) {
          console.log("Profile enrichment failed, using basic user:", profileError);
          setSession(currentSession);
          setUser(currentUser as any);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    clearStaleAuth();
  }, [enrichUserWithProfile, setUser, setSession]);

  // Auth state management effect
  useEffect(() => {
    if (authListenerInitialized.current) return;
    
    let mounted = true;
    console.log("Setting up auth state listener");
    authListenerInitialized.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log("User signed out or no session, clearing state");
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          setSession(newSession);
          
          if (newSession?.user) {
            try {
              console.log("Enriching user profile for:", newSession.user.id);
              const enrichedUser = await enrichUserWithProfile(newSession.user);
              if (mounted) {
                setUser(enrichedUser);
                setLoading(false);
              }
            } catch (error) {
              console.error("Error enriching user data:", error);
              if (mounted) {
                setUser(newSession.user as any);
                setLoading(false);
              }
            }
          }
        }
      }
    );
    
    return () => {
      mounted = false;
      authListenerInitialized.current = false;
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
