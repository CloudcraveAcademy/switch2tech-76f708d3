
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import type { UserWithProfile, UserRole } from "@/types/auth";
import { useUserProfile } from "@/hooks/useUserProfile";

export const useAuthProvider = () => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { enrichUserWithProfile } = useUserProfile();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setLoading(false);
        throw error;
      }
      console.log("Login successful, auth state listener will handle session");

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      console.log("Attempting registration for:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' '),
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

  const logout = async () => {
    try {
      console.log("Attempting logout");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Logout successful, clearing state manually");
      setUser(null);
      setSession(null);
      
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        setSession(newSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const enrichedUser = await enrichUserWithProfile(newSession?.user ?? null);
          console.log("Enriched user data after sign in:", enrichedUser);
          setUser(enrichedUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    const initSession = async () => {
      console.log("Checking for existing session");
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      console.log("Existing session:", existingSession ? "exists" : "none");
      setSession(existingSession);
      
      const enrichedUser = await enrichUserWithProfile(existingSession?.user ?? null);
      console.log("Initial enriched user:", enrichedUser);
      setUser(enrichedUser);
      setLoading(false);
    };

    initSession();
    
    return () => {
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
  };
};
