import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EngagementDataPoint {
  date: string;
  engagement: number;
  completion: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  students: number;
}

export interface StudentGrowthDataPoint {
  date: string;
  students: number;
}

export const useInstructorEngagementData = (instructorId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['instructor-engagement', instructorId, days],
    queryFn: async (): Promise<EngagementDataPoint[]> => {
      if (!instructorId) return [];

      // Get instructor's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId);

      if (!courses?.length) return [];

      const courseIds = courses.map(c => c.id);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Generate data points for each day
      const dataPoints: EngagementDataPoint[] = [];
      
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];

        // Get enrollments for this date
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('completed')
          .in('course_id', courseIds)
          .lte('enrollment_date', currentDate.toISOString());

        const totalEnrollments = enrollments?.length || 0;
        const completedEnrollments = enrollments?.filter(e => e.completed).length || 0;

        // Calculate engagement based on recent activity (using quiz submissions and assignment submissions as proxy)
        const { data: quizSubmissions } = await supabase
          .from('quiz_submissions')
          .select('id')
          .gte('submitted_at', dateString)
          .lt('submitted_at', new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const { data: assignmentSubmissions } = await supabase
          .from('assignment_submissions')
          .select('id')
          .gte('submitted_at', dateString)
          .lt('submitted_at', new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const engagement = Math.min(
          ((quizSubmissions?.length || 0) + (assignmentSubmissions?.length || 0)) * 10,
          100
        );

        const completion = totalEnrollments > 0 ? 
          Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

        dataPoints.push({
          date: dateString,
          engagement,
          completion
        });
      }

      return dataPoints;
    },
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInstructorRevenueData = (instructorId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['instructor-revenue', instructorId, days],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      if (!instructorId) return [];

      // Get instructor's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId);

      if (!courses?.length) return [];

      const courseIds = courses.map(c => c.id);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const dataPoints: RevenueDataPoint[] = [];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const nextDateString = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get revenue for this date
        const { data: transactions } = await supabase
          .from('payment_transactions')
          .select('amount')
          .in('course_id', courseIds)
          .eq('status', 'completed')
          .gte('created_at', dateString)
          .lt('created_at', nextDateString);

        // Get enrollments for this date
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id')
          .in('course_id', courseIds)
          .gte('enrollment_date', dateString)
          .lt('enrollment_date', nextDateString);

        const revenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const students = enrollments?.length || 0;

        dataPoints.push({
          date: dateString,
          revenue,
          students
        });
      }

      return dataPoints;
    },
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInstructorStudentGrowth = (instructorId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['instructor-student-growth', instructorId, days],
    queryFn: async (): Promise<StudentGrowthDataPoint[]> => {
      if (!instructorId) return [];

      // Get instructor's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId);

      if (!courses?.length) return [];

      const courseIds = courses.map(c => c.id);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const dataPoints: StudentGrowthDataPoint[] = [];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];

        // Get cumulative student count up to this date
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('student_id')
          .in('course_id', courseIds)
          .lte('enrollment_date', currentDate.toISOString());

        // Count unique students
        const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

        dataPoints.push({
          date: dateString,
          students: uniqueStudents
        });
      }

      return dataPoints;
    },
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};