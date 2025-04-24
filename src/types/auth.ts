
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
  login: (email: string, password: string) => Promise<any>; // Changed return type to allow any return value
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}
