import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseRatingData {
  average_rating: number;
  total_ratings: number;
}

export const useCourseRating = (courseId: string) => {
  return useQuery({
    queryKey: ['course-rating-stats', courseId],
    queryFn: async (): Promise<CourseRatingData> => {
      const { data, error } = await supabase.rpc('get_course_rating_stats', {
        course_id_param: courseId
      });

      if (error) throw error;
      
      const stats = data?.[0];
      return {
        average_rating: stats?.average_rating || 0,
        total_ratings: stats?.total_ratings || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};