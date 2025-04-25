
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import type { UserWithProfile, UserRole } from "@/types/auth";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = (onLogout?: () => void) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { enrichUserWithProfile } = useUserProfile();

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setLoading(false);
        throw error;
      }
      
      console.log("Login successful, auth state listener will handle session");
      return data;
      
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      console.log("Attempting registration for:", email);
      setLoading(true);
      
      // Split name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error);
        setLoading(false);
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      setLoading(false);
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      console.log("Attempting logout");
      setLoading(true);
      
      // Clear auth state first to prevent UI flashing
      setUser(null);
      setSession(null);
      
      // Then perform the actual logout
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error("Logout error:", error);
        setLoading(false);
        throw error;
      }
      
      console.log("Logout successful");
      
      // Clear any localStorage items that might contain user data
      localStorage.removeItem('supabase.auth.token');
      
      setLoading(false);
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Call the onLogout callback if provided (for navigation)
      if (onLogout) {
        onLogout();
      }
      
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  }, [toast, onLogout]);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          // Use setTimeout to prevent potential Supabase deadlocks
          setTimeout(async () => {
            const enrichedUser = await enrichUserWithProfile(newSession?.user ?? null);
            console.log("Enriched user data after sign in:", enrichedUser);
            setUser(enrichedUser);
            setLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const initSession = async () => {
      console.log("Checking for existing session");
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      console.log("Existing session:", existingSession ? "exists" : "none");
      
      if (existingSession) {
        setSession(existingSession);
        const enrichedUser = await enrichUserWithProfile(existingSession?.user ?? null);
        console.log("Initial enriched user:", enrichedUser);
        setUser(enrichedUser);
      }
      setLoading(false);
    };

    initSession();
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [enrichUserWithProfile]);

  // Add a method to validate the session
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
      
      // Check if token is expired or will expire soon (within 5 minutes)
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
      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      setUser(null);
      setSession(null);
      return false;
    }
  }, [enrichUserWithProfile]);

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
