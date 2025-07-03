
import React from "react";
import { Route, Routes } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import CoursesDashboard from "./courses/CoursesDashboard";
import CourseDetails from "./courses/CourseDetails";
import LessonsDashboard from "./lessons/LessonsDashboard";
import LessonDetails from "./lessons/LessonDetails";
import AssignmentsDashboard from "./assignments/AssignmentsDashboard";
import AssignmentDetails from "./assignments/AssignmentDetails";
import UsersDashboard from "./users/UsersDashboard";
import UserDetails from "./users/UserDetails";
import EnrollmentsDashboard from "./enrollments/EnrollmentsDashboard";
import SettingsDashboard from "./settings/SettingsDashboard";
import SupportDashboard from "./support/SupportDashboard";
import SupportTicketDetails from "./support/SupportTicketDetails";
import AdminDashboard from "./AdminDashboard";
import CourseCategoriesManager from "./admin/CourseCategoriesManager";
import PaymentGatewaysManager from "./admin/PaymentGatewaysManager";
import StudentSuccessStories from "@/components/home/StudentSuccessStoriesSection";
import SuccessStoriesManager from "./admin/SuccessStoriesManager";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      
      {/* Courses Routes */}
      <Route path="courses" element={<CoursesDashboard />} />
      <Route path="courses/:courseId" element={<CourseDetails />} />

      {/* Lessons Routes */}
      <Route path="courses/:courseId/lessons" element={<LessonsDashboard />} />
      <Route path="courses/:courseId/lessons/:lessonId" element={<LessonDetails />} />

      {/* Assignments Routes */}
      <Route path="courses/:courseId/assignments" element={<AssignmentsDashboard />} />
      <Route path="courses/:courseId/assignments/:assignmentId" element={<AssignmentDetails />} />

      {/* Users Routes */}
      <Route path="users" element={<UsersDashboard />} />
      <Route path="users/:userId" element={<UserDetails />} />

      {/* Enrollments Route */}
      <Route path="enrollments" element={<EnrollmentsDashboard />} />

      {/* Settings Route */}
      <Route path="settings" element={<SettingsDashboard />} />

      {/* Support Route */}
      <Route path="support" element={<SupportDashboard />} />
      <Route path="support/:ticketId" element={<SupportTicketDetails />} />
      
      {/* Admin Routes */}
      <Route path="admin">
        <Route path="/" element={<AdminDashboard />} />
        <Route path="course-categories" element={<CourseCategoriesManager />} />
        <Route path="payment-gateways" element={<PaymentGatewaysManager />} />
        <Route path="success-stories" element={<SuccessStoriesManager />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoutes;
