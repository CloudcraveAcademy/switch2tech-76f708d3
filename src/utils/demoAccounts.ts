
// Simple mock user account data for login in development mode
export const demoAccounts = [
  {
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'instructor@example.com',
    password: 'password',
    name: 'Instructor User', 
    role: 'instructor'
  },
  {
    email: 'student@example.com',
    password: 'password',
    name: 'Student User',
    role: 'student'
  }
] as const;
