
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { DashboardStats } from "./dashboard/DashboardStats";
import EnrolledCourses from "./dashboard/EnrolledCourses";
import UpcomingLiveClasses from "./dashboard/UpcomingLiveClasses";
import { Announcements } from "./dashboard/Announcements";
import StudentStatistics from "./dashboard/StudentStatistics";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['student-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const [coursesResponse, completedCoursesResponse, sessionsResponse, profileResponse] = await Promise.all([
        // Get total enrolled courses
        supabase
          .from('enrollments')
          .select('id', { count: 'exact' })
          .eq('student_id', user.id),
          
        // Get completed courses
        supabase
          .from('enrollments')
          .select('id', { count: 'exact' })
          .eq('student_id', user.id)
          .eq('completed', true),
          
        // Get upcoming sessions
        supabase
          .from('class_sessions')
          .select('id', { count: 'exact' })
          .gte('start_time', new Date().toISOString()),

        // Get user profile data
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
      ]);
      
      return {
        totalCourses: coursesResponse.count || 0,
        completedCourses: completedCoursesResponse.count || 0,
        upcomingSessions: sessionsResponse.count || 0,
        userProfile: profileResponse.data,
        // Added average progress calculation
        averageProgress: 0 // Will be calculated below if there are enrolled courses
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Calculate average progress across all enrolled courses
  const { data: averageProgress } = useQuery({
    queryKey: ['average-progress', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('student_id', user.id);
        
      if (error || !data || data.length === 0) return 0;
      
      const total = data.reduce((sum, course) => sum + (course.progress || 0), 0);
      return Math.round(total / data.length);
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Combine stats with average progress
  const combinedStats = {
    ...stats,
    averageProgress: averageProgress || 0
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {stats?.userProfile?.first_name || user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-3">
          <DashboardStats stats={combinedStats || {
            totalCourses: 0,
            completedCourses: 0,
            upcomingSessions: 0,
            averageProgress: 0
          }} />
        </div>

        <div className="col-span-3">
          <StudentStatistics />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <EnrolledCourses />
          <UpcomingLiveClasses />
        </div>

        <div className="col-span-1 space-y-6">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
