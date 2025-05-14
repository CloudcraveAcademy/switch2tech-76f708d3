
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "./dashboard/DashboardStats";
import EnrolledCourses from "./dashboard/EnrolledCourses";
import UpcomingLiveClasses from "./dashboard/UpcomingLiveClasses";
import Announcements from "./dashboard/Announcements";
import { Skeleton } from "@/components/ui/skeleton";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { profileData, loading } = useProfileData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profileData?.first_name || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your learning journey and upcoming activities.
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Courses & Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column - Course Progress */}
        <div className="lg:col-span-2 space-y-6">
          <EnrolledCourses />
        </div>

        {/* Side Column - Live Classes & Announcements */}
        <div className="space-y-6">
          <UpcomingLiveClasses />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
