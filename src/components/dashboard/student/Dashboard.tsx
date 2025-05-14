
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import EnrolledCourses from "./dashboard/EnrolledCourses";
import UpcomingLiveClasses from "./dashboard/UpcomingLiveClasses";
import DashboardStats from "./dashboard/DashboardStats";
import Announcements from "./dashboard/Announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// This is a refactored version of the StudentDashboard component
const StudentDashboard = () => {
  const { user, loading } = useAuth();
  const { profileData, isLoading: profileLoading } = useProfileData();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', user?.id],
    queryFn: async () => {
      try {
        // Get enrollments count
        const { count: enrollmentsCount, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user?.id);
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Get completed courses count (courses with 100% progress)
        const { count: completedCount, error: completedError } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user?.id)
          .eq('progress', 100);
          
        if (completedError) throw completedError;
        
        // Get certificates count
        const { count: certificatesCount, error: certificatesError } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user?.id);
          
        if (certificatesError) throw certificatesError;
        
        // Get total hours (from enrolled courses)
        const { data: coursesData, error: coursesError } = await supabase
          .from('enrollments')
          .select(`
            course:courses (
              duration_hours
            )
          `)
          .eq('student_id', user?.id);
          
        if (coursesError) throw coursesError;
        
        const totalHours = coursesData.reduce((acc, enrollment) => {
          return acc + (enrollment.course?.duration_hours || 0);
        }, 0);
        
        return {
          enrolledCourses: enrollmentsCount || 0,
          completedCourses: completedCount || 0,
          certificates: certificatesCount || 0,
          hoursLearned: totalHours || 0
        };
      } catch (error) {
        console.error("Error fetching student stats:", error);
        return {
          enrolledCourses: 0,
          completedCourses: 0,
          certificates: 0,
          hoursLearned: 0
        };
      }
    },
    enabled: !!user?.id
  });

  if (loading || profileLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {profileData?.first_name || user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      <DashboardStats stats={stats || {
        enrolledCourses: 0,
        completedCourses: 0,
        certificates: 0,
        hoursLearned: 0
      }} />
      
      <div className="mb-10">
        <EnrolledCourses />
      </div>

      <div className="mb-10">
        <UpcomingLiveClasses />
      </div>
      
      <div>
        <Announcements />
      </div>
    </div>
  );
};

export default StudentDashboard;
