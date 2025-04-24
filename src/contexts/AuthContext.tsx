import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "student" | "instructor" | "admin" | "super_admin";

// Extended user type with additional profile information
export interface UserWithProfile extends SupabaseUser {
  name?: string;
  avatar?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to enrich user data with profile information
  const enrichUserWithProfile = async (user: SupabaseUser | null): Promise<UserWithProfile | null> => {
    if (!user) return null;
    
    try {
      console.log("Fetching profile for user:", user.id);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, role, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error || !profile) {
        console.error("Error fetching user profile:", error);
        return user as UserWithProfile;
      }
      
      console.log("Profile data fetched:", profile);
      return {
        ...user,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        avatar: profile.avatar_url,
        role: profile.role as UserRole
      };
    } catch (error) {
      console.error("Error enriching user data:", error);
      return user as UserWithProfile;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        setSession(newSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Enrich user data
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

    // THEN check for existing session
    const initSession = async () => {
      console.log("Checking for existing session");
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      console.log("Existing session:", existingSession ? "exists" : "none");
      setSession(existingSession);
      
      // Enrich user data
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
        setLoading(false); // Reset loading state on error
        throw error;
      }
      console.log("Login successful, auth state listener will handle session");
      // Auth state listener will handle setting user/session

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false); // Reset loading state on error
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
        setLoading(false); // Reset loading state on error
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
      setLoading(false); // Reset loading state on error
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
      // Manual cleanup in addition to listener
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
      setLoading(false); // Always reset loading state after logout attempt
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
