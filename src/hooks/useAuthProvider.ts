
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export interface UserWithProfile extends User {
  name?: string;
  avatar?: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

export const useAuthProvider = () => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearAuthState = () => {
    if (!mounted.current) return;
    console.log("Clearing auth state");
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const processAuthUser = async (session: Session | null) => {
    if (!mounted.current || initializingRef.current) return;
    
    try {
      if (session?.user?.id) {
        console.log("Processing auth user:", session.user.email);
        
        // Try to fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // If it's an auth error, clear the session
          if (profileError.message?.includes('JWT') || profileError.message?.includes('auth')) {
            console.log("Invalid session detected, signing out");
            await supabase.auth.signOut();
            clearAuthState();
            return;
          }
        }
        
        // Ensure role is properly typed as UserRole
        const userRole: UserRole = profile?.role as UserRole || 'student';
        
        const userWithProfile: UserWithProfile = {
          ...session.user,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.first_name || 'User' : 'User',
          avatar: profile?.avatar_url || '',
          role: userRole
        };
        
        if (mounted.current) {
          console.log("User authenticated successfully:", userWithProfile.email);
          setUser(userWithProfile);
          setSession(session);
          setLoading(false);
        }
      } else {
        console.log("No valid session found");
        clearAuthState();
      }
    } catch (error) {
      console.error("Error processing auth user:", error);
      clearAuthState();
    }
  };

  useEffect(() => {
    if (initializingRef.current) return;
    
    console.log("Initializing auth state...");
    initializingRef.current = true;
    
    // Set up auth state listener
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;
      
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      // Handle specific events
      if (event === 'SIGNED_OUT') {
        clearAuthState();
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await processAuthUser(session);
        return;
      }
      
      // For initial load or other events
      await processAuthUser(session);
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          clearAuthState();
          return;
        }
        
        if (mounted.current) {
          await processAuthUser(session);
          initializingRef.current = false;
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        clearAuthState();
        initializingRef.current = false;
      }
    };

    getInitialSession();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
      initializingRef.current = false;
    };
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out user");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      clearAuthState();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    logout
  };
};
