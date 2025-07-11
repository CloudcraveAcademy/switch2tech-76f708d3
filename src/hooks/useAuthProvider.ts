
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
    if (!mounted.current) return;
    
    try {
      if (session?.user?.id) {
        console.log("Processing auth user:", session.user.email);
        
        // Try to fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
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
        
        // Ensure role is properly typed as UserRole, even if no profile exists
        const userRole: UserRole = profile?.role as UserRole || 'student';
        
        const userWithProfile: UserWithProfile = {
          ...session.user,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.first_name || 'User' : session.user.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || '',
          role: userRole,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
          bio: profile?.bio || ''
        };
        
        if (mounted.current) {
          console.log("User authenticated successfully:", userWithProfile.email, "Role:", userWithProfile.role);
          setUser(userWithProfile);
          setSession(session);
          setLoading(false);
        }
      } else {
        console.log("No valid session found");
        clearAuthState();
        return;
      }
    } catch (error) {
      console.error("Error processing auth user:", error);
      // Don't clear auth state for profile errors, just continue with basic user data
      if (session?.user && mounted.current) {
        const basicUser: UserWithProfile = {
          ...session.user,
          name: session.user.email?.split('@')[0] || 'User',
          avatar: '',
          role: 'student' as UserRole
        };
        console.log("Using basic user data due to profile error");
        setUser(basicUser);
        setSession(session);
        setLoading(false);
      } else {
        clearAuthState();
      }
      return;
    }
  };

  useEffect(() => {
    if (initializingRef.current) return;
    
    console.log("Initializing auth state...");
    initializingRef.current = true;
    
    // Set up auth state listener
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;
      
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      // Handle specific events
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing state");
        clearAuthState();
        return;
      }
      
      // Process the auth user for all events that have a session
      if (session) {
        // For SIGNED_IN events, process immediately to ensure quick redirect
        if (event === 'SIGNED_IN') {
          processAuthUser(session);
        } else {
          // Use setTimeout for other events to prevent deadlocks
          setTimeout(() => {
            processAuthUser(session);
          }, 0);
        }
      } else {
        clearAuthState();
      }
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
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        clearAuthState();
      }
    };

    getInitialSession();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
      // Don't reset initializingRef here - it causes re-initialization loops
    };
  }, []);

  const logout = async () => {
    try {
      console.log("Starting logout process");
      setLoading(true);
      
      // Clear local state immediately
      clearAuthState();
      
      // Then perform the actual logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state
      clearAuthState();
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
