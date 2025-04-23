
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
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, role, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error || !profile) {
        console.error("Error fetching user profile:", error);
        return user as UserWithProfile;
      }
      
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        // Enrich user data
        const enrichedUser = await enrichUserWithProfile(newSession?.user ?? null);
        setUser(enrichedUser);
        setLoading(false);
      }
    );

    // Check for existing session
    const initSession = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      
      // Enrich user data
      const enrichedUser = await enrichUserWithProfile(existingSession?.user ?? null);
      setUser(enrichedUser);
      setLoading(false);
    };

    initSession();
    
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
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

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });

    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
