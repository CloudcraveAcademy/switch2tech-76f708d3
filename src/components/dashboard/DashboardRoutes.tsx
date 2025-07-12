
import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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

// Import certificate components
import InstructorCertificates from "./instructor/Certificates";
import AdminCertificates from "./admin/Certificates";

// Import assignment and quiz components
import AssignmentOverview from "./admin/AssignmentOverview";
import InstructorAssignments from "./instructor/InstructorAssignments";
import InstructorQuizzes from "./instructor/InstructorQuizzes";
import InstructorDiscussions from "./instructor/InstructorDiscussions";

// Import admin pages
import UsersPage from "@/pages/admin/UsersPage";
import CoursesPage from "@/pages/admin/CoursesPage";
import FinancePage from "@/pages/admin/FinancePage";
import ReportsPage from "@/pages/admin/ReportsPage"; 
import SupportTicketsPage from "@/pages/admin/SupportTicketsPage";
import AnnouncementsPage from "@/pages/admin/AnnouncementsPage";
import SystemPage from "@/pages/admin/SystemPage";
import RatingsPage from "@/pages/admin/RatingsPage";

const DashboardRoutes = () => {
  const { user } = useAuth();
  
  // Stable role determination
  const currentRole = useMemo(() => {
    return user?.role || "student";
  }, [user?.role]);
  
  // Debug logging only when role actually changes
  useEffect(() => {
    console.log("Dashboard role stabilized to:", currentRole);
  }, [currentRole]);

  // Get dashboard component based on stable role
  const dashboardComponent = useMemo(() => {
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
  }, [currentRole]);

  // Define route fragments based on role
  const studentRoutesFragment = useMemo(() => (
    <>
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/courses/:courseId" element={<CourseView />} />
    </>
  ), []);

  const instructorRoutesFragment = useMemo(() => (
    <>
      <Route path="/students" element={<MyStudents />} />
      <Route path="/revenue" element={<MyRevenue />} />
      <Route path="/certificates" element={<InstructorCertificates />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/courses/:courseId/edit" element={<CourseEdit />} />
      <Route path="/courses/:courseId/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Students</h1></div>} />
      <Route path="/assignments" element={<InstructorAssignments />} />
      <Route path="/quizzes" element={<InstructorQuizzes />} />
      <Route path="/discussions" element={<InstructorDiscussions />} />
    </>
  ), []);

  const adminRoutesFragment = useMemo(() => (
    <>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/certificates" element={<AdminCertificates />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/support-tickets" element={<SupportTicketsPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/system" element={<SystemPage />} />
      <Route path="/ratings" element={<RatingsPage />} />
      <Route path="/assignments-overview" element={<AssignmentOverview />} />
    </>
  ), []);

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
