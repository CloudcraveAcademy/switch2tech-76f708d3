
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./AdminDashboard";
import Profile from "./Profile";
import MyCourses from "./MyCourses";
import MyStudents from "./MyStudents";
import MyRevenue from "./MyRevenue";
import Settings from "./Settings";
import CreateCourse from "./CreateCourse";
import CourseEdit from "./CourseEdit";
import { useAuth } from "@/contexts/AuthContext";

const DashboardRoutes = () => {
  const { user } = useAuth();

  const getInitialDashboard = () => {
    switch (user?.role) {
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
      
      {/* Student Routes */}
      {user?.role === "student" && (
        <>
          <Route path="/my-courses" element={<div className="p-6"><h1 className="text-2xl font-bold">My Courses</h1></div>} />
          <Route path="/certificates" element={<div className="p-6"><h1 className="text-2xl font-bold">My Certificates</h1></div>} />
        </>
      )}
      
      {/* Instructor Routes */}
      {user?.role === "instructor" && (
        <>
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/students" element={<MyStudents />} />
          <Route path="/revenue" element={<MyRevenue />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/courses/:id/edit" element={<CourseEdit />} />
          <Route path="/courses/:id/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Students</h1></div>} />
        </>
      )}
      
      {/* Admin Routes */}
      {(user?.role === "admin" || user?.role === "super_admin") && (
        <>
          <Route path="/users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1></div>} />
          <Route path="/courses" element={<div className="p-6"><h1 className="text-2xl font-bold">Course Management</h1></div>} />
        </>
      )}
      
      {/* Common Routes */}
      <Route path="/notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1></div>} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
    </Routes>
  );
};

export default DashboardRoutes;
