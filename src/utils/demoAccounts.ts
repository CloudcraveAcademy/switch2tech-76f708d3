
import { supabase } from '../integrations/supabase/client';

// Function to check if user exists
const userExists = async (email: string) => {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  
  return !!data;
};

// Setup demo accounts
export const setupDemoAccounts = async () => {
  try {
    console.log("Setting up demo accounts...");
    
    // Create admin account
    const adminEmail = "admin@example.com";
    // Check if admin already exists using supabase auth API directly
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    const adminExists = checkError ? false : existingUsers?.users.some(user => user.email === adminEmail);
    
    if (!adminExists) {
      await createDemoUser({
        email: adminEmail,
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      });
    }
    
    // Create instructor account
    const instructorEmail = "instructor@example.com";
    const instructorExists = existingUsers?.users.some(user => user.email === instructorEmail) || false;
    
    if (!instructorExists) {
      await createDemoUser({
        email: instructorEmail,
        password: "instructor123",
        firstName: "Test",
        lastName: "Instructor",
        role: "instructor"
      });
    }
    
    // Create student account
    const studentEmail = "student@example.com";
    const studentExists = existingUsers?.users.some(user => user.email === studentEmail) || false;
    
    if (!studentExists) {
      await createDemoUser({
        email: studentEmail,
        password: "student123",
        firstName: "Test",
        lastName: "Student",
        role: "student"
      });
    }
    
    console.log("Demo accounts setup completed");
  } catch (error) {
    console.error("Error setting up demo accounts:", error);
  }
};

// Helper to create a demo user
const createDemoUser = async ({ 
  email, 
  password, 
  firstName, 
  lastName, 
  role 
}: { 
  email: string; 
  password: string; 
  firstName: string; 
  lastName: string; 
  role: string;
}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`Created ${role} account: ${email}`);
    return data;
  } catch (error) {
    console.error(`Error creating ${role} account:`, error);
    return null;
  }
};
