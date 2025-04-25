
import { useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import type { UserWithProfile } from "@/types/auth";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useSessionManager = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const { enrichUserWithProfile } = useUserProfile();

  const validateSession = useCallback(async () => {
    console.log("Validating session");
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log("No valid session found");
        setUser(null);
        setSession(null);
        return false;
      }
      
      const expiresAt = new Date((currentSession.expires_at || 0) * 1000);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
        console.log("Session expired or expiring soon, refreshing");
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (error || !refreshedSession) {
          console.error("Session refresh failed:", error);
          setUser(null);
          setSession(null);
          return false;
        }
        
        setSession(refreshedSession);
        const enrichedUser = await enrichUserWithProfile(refreshedSession?.user ?? null);
        setUser(enrichedUser);
        return true;
      }
      
      console.log("Session is valid");
      setSession(currentSession);
      
      // Make sure we have the user data even if just validating
      if (!user && currentSession.user) {
        const enrichedUser = await enrichUserWithProfile(currentSession.user);
        setUser(enrichedUser);
      }
      
      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      // Don't clear user/session on network errors to prevent unnecessary logouts
      return !!session; // Return true if we already have a session
    }
  }, [enrichUserWithProfile, session, user]);

  const initializeSession = useCallback(async () => {
    try {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        setSession(existingSession);
        const enrichedUser = await enrichUserWithProfile(existingSession?.user ?? null);
        setUser(enrichedUser);
      }
    } catch (error) {
      console.error("Error initializing session:", error);
      // Don't throw here - allow the app to continue even if session init fails
    }
  }, [enrichUserWithProfile]);

  return {
    user,
    session,
    setUser,
    setSession,
    validateSession,
    initializeSession,
  };
};
