import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import StudentDashboard from "./student/Dashboard";
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
import LessonForm from "./course/LessonForm";

// Import admin pages
import UsersPage from "@/pages/admin/UsersPage";
import CoursesPage from "@/pages/admin/CoursesPage";
import FinancePage from "@/pages/admin/FinancePage";
import ReportsPage from "@/pages/admin/ReportsPage"; 
import SupportTicketsPage from "@/pages/admin/SupportTicketsPage";
import AnnouncementsPage from "@/pages/admin/AnnouncementsPage";
import SystemPage from "@/pages/admin/SystemPage";

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

  // Add debug logging to help troubleshoot role-related issues
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current role in state:", currentRole);
  }, [user, currentRole]);

  // Prepare all route fragments regardless of role
  const studentRoutesFragment = (
    <>
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/courses/:courseId" element={<CourseView />} />
    </>
  );

  const instructorRoutesFragment = (
    <>
      <Route path="/students" element={<MyStudents />} />
      <Route path="/revenue" element={<MyRevenue />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/courses/:id/edit" element={<CourseEdit />} />
      <Route path="/courses/:id/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Students</h1></div>} />
    </>
  );

  const adminRoutesFragment = (
    <>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/support-tickets" element={<SupportTicketsPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/system" element={<SystemPage />} />
    </>
  );

  // Get dashboard component based on role
  const dashboardComponent = (() => {
    // Force log to debug
    console.log("Selecting dashboard for role:", currentRole);
    
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

  // Return routes with conditional fragments
  return (
    <Routes>
      <Route path="/" element={dashboardComponent} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Student and Instructor Routes */}
      <Route path="/my-courses" element={currentRole === "instructor" ? <InstructorMyCourses /> : <MyCourses />} />
      
      {/* Role-specific routes - conditionally rendered */}
      {currentRole === "student" && studentRoutesFragment}
      {currentRole === "instructor" && instructorRoutesFragment}
      {(currentRole === "admin" || currentRole === "super_admin") && adminRoutesFragment}
      
      {/* Common Routes */}
      <Route path="/courses/:courseId/lessons/new" element={<LessonForm />} />
      <Route path="/courses/:courseId/lessons/:lessonId/edit" element={<LessonForm />} />
      <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
    </Routes>
  );
};

export default DashboardRoutes;
