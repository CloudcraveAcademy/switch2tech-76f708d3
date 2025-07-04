
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import MyCourses from "../MyCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CoursesDashboard = () => {
  const { user } = useAuth();

  if (user?.role === "student") {
    return <MyCourses />;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Courses Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course management interface for {user?.role}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesDashboard;
