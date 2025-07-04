
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./admin/AdminDashboard";

const DashboardHome = () => {
  const { user } = useAuth();

  console.log("DashboardHome - Current user role:", user?.role);

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case "student":
      console.log("Rendering StudentDashboard");
      return <StudentDashboard />;
    case "instructor":
      console.log("Rendering InstructorDashboard");
      return <InstructorDashboard />;
    case "admin":
    case "super_admin":
      console.log("Rendering AdminDashboard");
      return <AdminDashboard />;
    default:
      console.log("Rendering default StudentDashboard");
      return <StudentDashboard />;
  }
};

export default DashboardHome;
