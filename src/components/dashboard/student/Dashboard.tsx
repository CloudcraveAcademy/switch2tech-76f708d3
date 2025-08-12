
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
      
      const [enrollmentsResponse, sessionsResponse, profileResponse, previousStatsResponse] = await Promise.all([
        // Get all enrollments with progress data
        supabase
          .from('enrollments')
          .select('id, progress, completed, course_id, enrollment_date')
          .eq('student_id', user.id),
          
        // Get upcoming sessions for enrolled courses
        (async () => {
          const { data: enrolledCourses } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('student_id', user.id);
          
          if (!enrolledCourses || enrolledCourses.length === 0) {
            return { count: 0 };
          }
          
          const courseIds = enrolledCourses.map(e => e.course_id);
          return await supabase
            .from('class_sessions')
            .select('id', { count: 'exact' })
            .gte('start_time', new Date().toISOString())
            .in('course_id', courseIds);
        })(),

        // Get user profile data
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single(),

        // Get lesson progress to calculate actual completion percentage
        supabase
          .from('student_lesson_progress')
          .select('lesson_id, completed, course_id, last_accessed')
          .eq('student_id', user.id)
      ]);
      
      const enrollments = enrollmentsResponse.data || [];
      const lessonProgress = previousStatsResponse.data || [];
      const totalCourses = enrollments.length;
      const completedCourses = enrollments.filter(e => e.completed).length;
      
      // Calculate actual course completion progress based on lessons completed
      let courseCompletionProgress = 0;
      let previousWeekProgress = 0;
      
      if (enrollments.length > 0) {
        // Get total lessons for enrolled courses
        const courseIds = enrollments.map(e => e.course_id);
        const { data: allLessons } = await supabase
          .from('lessons')
          .select('id, course_id')
          .in('course_id', courseIds);
        
        const totalLessons = allLessons?.length || 0;
        const completedLessons = lessonProgress.filter(p => p.completed).length;
        
        courseCompletionProgress = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;
        
        // Calculate progress from a week ago for comparison
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const completedLessonsWeekAgo = lessonProgress.filter(p => 
          p.completed && p.last_accessed && new Date(p.last_accessed) <= oneWeekAgo
        ).length;
        
        previousWeekProgress = totalLessons > 0 
          ? Math.round((completedLessonsWeekAgo / totalLessons) * 100) 
          : 0;
      }
      
      const progressChange = courseCompletionProgress - previousWeekProgress;
      
      return {
        totalCourses,
        completedCourses,
        upcomingSessions: sessionsResponse.count || 0,
        userProfile: profileResponse.data,
        courseCompletionProgress,
        progressChange
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Stats already include averageProgress, no need for separate query

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
          <DashboardStats stats={stats || {
            totalCourses: 0,
            completedCourses: 0,
            upcomingSessions: 0,
            courseCompletionProgress: 0,
            progressChange: 0
          }} />
        </div>

        <div className="col-span-3">
          <StudentStatistics />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="w-full">
            <EnrolledCourses />
          </div>
          <div className="w-full">
            <UpcomingLiveClasses />
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
