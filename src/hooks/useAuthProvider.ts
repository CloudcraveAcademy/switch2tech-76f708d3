
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./auth/useAuthOperations";
import { useSessionManager } from "./auth/useSessionManager";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: (path?: string) => void) => {
  const [loading, setLoading] = useState(true);
  const authListenerInitialized = useRef(false);
  const initializationInProgress = useRef(false);
  
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
    if (initializationInProgress.current) return;
    
    const initializeAuth = async () => {
      initializationInProgress.current = true;
      
      try {
        console.log("Initializing auth state...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log("Session error during initialization:", error);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (!currentSession) {
          console.log("No session found during initialization");
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        // Verify session is valid
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          console.log("Invalid session detected during initialization:", userError);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        console.log("Valid session found, enriching user profile");
        setSession(currentSession);
        
        try {
          const enrichedUser = await enrichUserWithProfile(currentUser);
          setUser(enrichedUser);
        } catch (profileError) {
          console.log("Profile enrichment failed, using basic user data:", profileError);
          // Use basic user data as fallback instead of clearing everything
          setUser({
            ...currentUser,
            role: 'student' // Safe fallback
          } as any);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setSession(null);
        setLoading(false);
      } finally {
        initializationInProgress.current = false;
      }
    };

    initializeAuth();
  }, [enrichUserWithProfile, setUser, setSession]);

  // Auth state listener effect
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
          if (mounted) setLoading(false);
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
                // Use basic user data as fallback
                setUser({
                  ...newSession.user,
                  role: 'student' // Safe fallback
                } as any);
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
