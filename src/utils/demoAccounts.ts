
import { supabase } from "@/integrations/supabase/client";

export type DemoAccountType = "admin" | "instructor" | "student";

export const demoAccounts = {
  admin: {
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin" as const
  },
  instructor: {
    email: "instructor@example.com",
    password: "Instructor123!",
    role: "instructor" as const
  },
  student: {
    email: "student@example.com",
    password: "Student123!",
    role: "student" as const
  }
};

export const createDemoAccountIfNotExists = async (accountType: DemoAccountType) => {
  try {
    const account = demoAccounts[accountType];
    
    // Check if the user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', account.email)
      .maybeSingle();
      
    if (!existingUser) {
      // User doesn't exist, create it
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            role: account.role,
            first_name: accountType.charAt(0).toUpperCase() + accountType.slice(1),
            last_name: "User"
          }
        }
      });
      
      if (error) {
        console.error(`Error creating ${accountType} demo account:`, error);
        return false;
      }
      
      console.log(`${accountType} demo account created successfully`);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking/creating ${accountType} demo account:`, error);
    return false;
  }
};

export const setupDemoAccounts = async () => {
  try {
    await Promise.all([
      createDemoAccountIfNotExists('admin'),
      createDemoAccountIfNotExists('instructor'),
      createDemoAccountIfNotExists('student')
    ]);
    
    console.log('Demo accounts setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    return false;
  }
};
