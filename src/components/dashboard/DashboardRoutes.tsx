
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./AdminDashboard";
import Profile from "./Profile";
import MyCourses from "./student/MyCourses";
import Certificates from "./student/Certificates";
import MyStudents from "./MyStudents";
import MyRevenue from "./MyRevenue";
import Settings from "./Settings";
import Notifications from "./Notifications";
import CreateCourse from "./CreateCourse";
import CourseEdit from "./CourseEdit";
import CourseView from "@/components/CourseView";
import { useAuth } from "@/contexts/AuthContext";
import InstructorMyCourses from "./MyCourses";

const DashboardRoutes = () => {
  // Always call hooks at the top level
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || "student");
  
  // Update the role only when the user is loaded and different from current role
  useEffect(() => {
    if (user?.role && user.role !== currentRole) {
      console.log("Dashboard role updated to:", user.role);
      setCurrentRole(user.role);
    }
  }, [user?.role, currentRole]);

  // Define all components regardless of role
  const studentComponents = (
    <>
      <Route path="/certificates" element={<Certificates />} />
    </>
  );

  const instructorComponents = (
    <>
      <Route path="/students" element={<MyStudents />} />
      <Route path="/revenue" element={<MyRevenue />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/courses/:id/edit" element={<CourseEdit />} />
      <Route path="/courses/:id/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Students</h1></div>} />
    </>
  );

  const adminComponents = (
    <>
      <Route path="/users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1></div>} />
      <Route path="/courses" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Management</h1></div>} />
    </>
  );

  // Determine which dashboard to render based on role
  const initialDashboard = (() => {
    switch (currentRole) {
      case "instructor":
        return <InstructorDashboard />;
      case "admin":
      case "super_admin":
        return <AdminDashboard />;
      case "student":
      default:
        return <StudentDashboard />;
    }
  })();

  return (
    <Routes>
      <Route path="/" element={initialDashboard} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Student and Instructor Routes */}
      <Route path="/my-courses" element={currentRole === "instructor" ? <InstructorMyCourses /> : <MyCourses />} />
      <Route path="/courses/:courseId" element={<CourseView />} />
      
      {/* Conditional routes based on role */}
      {currentRole === "student" && studentComponents}
      {currentRole === "instructor" && instructorComponents}
      {(currentRole === "admin" || currentRole === "super_admin") && adminComponents}
      
      {/* Common Routes */}
      <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
    </Routes>
  );
};

export default DashboardRoutes;
