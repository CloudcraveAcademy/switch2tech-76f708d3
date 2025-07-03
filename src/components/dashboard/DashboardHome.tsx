
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "./student/Dashboard";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./admin/AdminDashboard";

const DashboardHome = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case "student":
      return <StudentDashboard />;
    case "instructor":
      return <InstructorDashboard />;
    case "admin":
    case "super_admin":
      return <AdminDashboard />;
    default:
      return <div>Access denied</div>;
  }
};

export default DashboardHome;
