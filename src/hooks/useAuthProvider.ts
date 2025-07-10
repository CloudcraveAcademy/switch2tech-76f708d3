
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import type { AuthContextType, UserWithProfile, UserRole } from "@/types/auth";

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    login: authLogin, 
    register: authRegister, 
    logout: authLogout,
    setLoading: setAuthLoading 
  } = useAuthOperations();

  const login = useCallback(async (email: string, password: string) => {
    return await authLogin(email, password);
  }, [authLogin]);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    return await authRegister(name, email, password, role);
  }, [authRegister]);

  const logout = useCallback(async (): Promise<void> => {
    await authLogout();
  }, [authLogout]);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log("Initializing auth state...");
    
    let mounted = true;

    // Set up auth state listener first
    console.log("Setting up auth state listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      if (session) {
        // Fetch user profile data to enhance the user object
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const userWithProfile: UserWithProfile = {
            ...session.user,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
            avatar: profile?.avatar_url || undefined,
            role: profile?.role as UserRole || undefined,
          };
          
          setUser(userWithProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(session.user as UserWithProfile);
        }
        setSession(session);
      } else {
        console.log("User signed out or no session, clearing state");
        setUser(null);
        setSession(null);
      }
      
      // Only set loading to false after we've processed the auth state
      setLoading(false);
    });

    // Then get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        }
        
        if (mounted && !session) {
          // Only update state if there's no session and we haven't already processed one
          console.log("Initial session check: no session");
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
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
