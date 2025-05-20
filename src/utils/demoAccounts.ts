
// Simple mock user account data for login in development mode
export const demoAccounts = [
  {
    email: "admin@example.com",
    password: "password",
    name: "Admin User",
    role: "admin"
  },
  {
    email: "instructor@example.com",
    password: "password",
    name: "Instructor User", 
    role: "instructor"
  },
  {
    email: "student@example.com",
    password: "password",
    name: "Student User",
    role: "student"
  }
] as const;

// Function to set up demo accounts in local storage or mock database
export const setupDemoAccounts = async () => {
  try {
    console.log("Setting up demo accounts for development");
    // In a real implementation, this might interact with a database
    // For now, we'll just ensure the accounts are available for demo purposes
    return true;
  } catch (error) {
    console.error("Error setting up demo accounts:", error);
    return false;
  }
};
