
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
    const adminExists = await checkIfUserExists(adminEmail);
    
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
    const instructorExists = await checkIfUserExists(instructorEmail);
    
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
    const studentExists = await checkIfUserExists(studentEmail);
    
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

// Helper to check if user exists to avoid the infinite recursion issue
const checkIfUserExists = async (email: string) => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
  return data.users.some(user => user.email === email);
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
