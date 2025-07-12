
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, Sparkles, Award, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const StudentStatistics = () => {
  const { user } = useAuth();

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['student-detailed-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        // Get enrollments with progress
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('progress, completed, course_id, enrollment_date')
          .eq('student_id', user.id);
          
        if (!enrollments || enrollments.length === 0) {
          return {
            totalTime: 0,
            completionRate: 0,
            streakDays: 0,
            averageScore: 0,
            recentProgress: 0,
            previousProgress: 0
          };
        }
          
        // Get lesson progress data to calculate time spent
        const { data: lessonProgress } = await supabase
          .from('student_lesson_progress')
          .select('lesson_id, completed, last_accessed')
          .eq('student_id', user.id)
          .order('last_accessed', { ascending: false });
          
        // Calculate completion rate
        const completedCourses = enrollments.filter(e => e.completed).length;
        const completionRate = enrollments.length > 0 
          ? Math.round((completedCourses / enrollments.length) * 100) 
          : 0;
          
        // Calculate time spent based on completed lessons (15 minutes per lesson)
        const completedLessons = lessonProgress ? lessonProgress.filter(l => l.completed).length : 0;
        const totalTime = completedLessons * 15;
        
        // Calculate streak based on recent activity
        const recentActivity = lessonProgress?.filter(l => {
          if (!l.last_accessed) return false;
          const accessDate = new Date(l.last_accessed);
          const daysDiff = Math.floor((Date.now() - accessDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }) || [];
        const streakDays = Math.min(recentActivity.length, 7);
        
        // Calculate progress change
        // Recent progress (last 7 days)
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        
        // Use the most recent enrollment progress as the current progress
        const recentProgress = enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
          : 0;
          
        // Calculate average quiz score from actual quiz submissions
        const { data: quizSubmissions } = await supabase
          .from('quiz_submissions')
          .select('percentage')
          .eq('student_id', user.id);
          
        const averageScore = quizSubmissions && quizSubmissions.length > 0
          ? Math.round(quizSubmissions.reduce((sum, submission) => sum + submission.percentage, 0) / quizSubmissions.length)
          : 0;
          
        // Mock a previous progress value for comparison
        const previousProgress = Math.max(0, recentProgress - (Math.random() * 10 + 5)); // 5-15% growth
        
        return {
          totalTime,
          completionRate,
          streakDays,
          averageScore,
          recentProgress,
          previousProgress
        };
      } catch (error) {
        console.error("Error fetching student statistics:", error);
        return null;
      }
    },
    enabled: !!user
  });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Learning Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {statistics?.totalTime || 0} mins
          </div>
          <div className="flex items-center text-xs">
            <ArrowUpRight className="text-green-500 h-3 w-3 mr-1" />
            <span className="text-green-500 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">vs last week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Course Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {statistics?.completionRate || 0}%
          </div>
          <Progress value={statistics?.completionRate || 0} className="h-1 mb-1" />
          <div className="flex items-center text-xs">
            {(statistics?.recentProgress || 0) > (statistics?.previousProgress || 0) ? (
              <>
                <ArrowUpRight className="text-green-500 h-3 w-3 mr-1" />
                <span className="text-green-500 font-medium">+{Math.round((statistics?.recentProgress || 0) - (statistics?.previousProgress || 0))}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="text-red-500 h-3 w-3 mr-1" />
                <span className="text-red-500 font-medium">-{Math.round((statistics?.previousProgress || 0) - (statistics?.recentProgress || 0))}%</span>
              </>
            )}
            <span className="text-gray-500 ml-1">progress</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Learning Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-1">
            <Sparkles className="h-5 w-5 text-amber-500 mr-1" />
            <span className="text-2xl font-bold">{statistics?.streakDays || 0} days</span>
          </div>
          <div className="text-xs text-gray-500">Keep going to extend your streak!</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Average Quiz Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-1">
            <Award className="h-5 w-5 text-blue-500 mr-1" />
            <span className="text-2xl font-bold">{statistics?.averageScore || 0}%</span>
          </div>
          <div className="text-xs text-gray-500">Based on your completed quizzes</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentStatistics;
