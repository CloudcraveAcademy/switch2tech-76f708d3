
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "student" | "instructor" | "admin" | "super_admin";

export interface UserWithProfile extends SupabaseUser {
  name?: string;
  avatar?: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // Added signOut method
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  validateSession: () => Promise<boolean>;
}
