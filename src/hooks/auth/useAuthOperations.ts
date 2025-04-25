
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types/auth";

export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const login = useCallback(async (email: string, password: string) => {
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
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    try {
      console.log("Attempting registration for:", email);
      setLoading(true);
      
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
        throw error;
      }

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
  }, [toast]);

  const logout = useCallback(async (onLogout?: (path?: string) => void) => {
    try {
      console.log("Attempting logout");
      setLoading(true);
      
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Logout successful");
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
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
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    login,
    register,
    logout,
    loading,
    setLoading,
  };
};
