import { Routes, Route } from "react-router-dom";
import { useRef } from "react";
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

const DashboardRoutes = () => {
  const { user } = useAuth();
  // Keep a stable reference to the user role
  const userRoleRef = useRef(user?.role);
  
  // Only update the role ref if there is a user with a role
  if (user?.role) {
    userRoleRef.current = user.role;
  }
  
  // Use the stable role reference
  const stableRole = userRoleRef.current || user?.role;

  const getInitialDashboard = () => {
    switch (stableRole) {
      case "student":
        return <StudentDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "admin":
      case "super_admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={getInitialDashboard()} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Student Routes */}
      {(stableRole === "student" || stableRole === "instructor") && (
        <>
          <Route path="/my-courses" element={stableRole === "instructor" ? <InstructorMyCourses /> : <MyCourses />} />
          <Route path="/courses/:courseId" element={<CourseView />} />
          {stableRole === "student" && (
            <Route path="/certificates" element={<Certificates />} />
          )}
        </>
      )}
      
      {/* Instructor Routes */}
      {stableRole === "instructor" && (
        <>
          <Route path="/students" element={<MyStudents />} />
          <Route path="/revenue" element={<MyRevenue />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/courses/:id/edit" element={<CourseEdit />} />
          <Route path="/courses/:id/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Students</h1></div>} />
        </>
      )}
      
      {/* Admin Routes */}
      {(stableRole === "admin" || stableRole === "super_admin") && (
        <>
          <Route path="/users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1></div>} />
          <Route path="/courses" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Management</h1></div>} />
        </>
      )}
      
      {/* Common Routes */}
      <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
    </Routes>
  );
};

// Fix missing import
import InstructorMyCourses from "./MyCourses";

export default DashboardRoutes;
