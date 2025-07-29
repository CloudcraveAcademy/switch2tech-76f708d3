import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseRatingDisplayProps {
  courseId: string;
}

interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: string]: number;
  };
}

const CourseRatingDisplay: React.FC<CourseRatingDisplayProps> = ({ courseId }) => {
  const { data: ratingStats, isLoading } = useQuery({
    queryKey: ['course-rating-stats', courseId],
    queryFn: async (): Promise<RatingStats> => {
      const { data, error } = await supabase.rpc('get_course_rating_stats', {
        course_id_param: courseId
      });

      if (error) throw error;
      
      const stats = data?.[0];
      if (!stats) {
        return {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        };
      }
      
      const distribution = stats?.rating_distribution;
      return {
        average_rating: stats?.average_rating || 0,
        total_ratings: stats?.total_ratings || 0,
        rating_distribution: (typeof distribution === 'object' && distribution !== null) 
          ? distribution as { [key: string]: number }
          : { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
      };
    }
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_ratings')
        .select(`
          *,
          student:user_profiles!student_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .not('review', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!ratingStats || ratingStats.total_ratings === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No ratings yet</p>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {ratingStats.average_rating.toFixed(1)}
            </div>
            {renderStars(Math.round(ratingStats.average_rating))}
            <div className="text-sm text-gray-500 mt-1">
              {ratingStats.total_ratings} rating{ratingStats.total_ratings !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingStats.rating_distribution[stars.toString()] || 0;
            const percentage = ratingStats.total_ratings > 0 
              ? (count / ratingStats.total_ratings) * 100 
              : 0;
            
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-8">{stars}</span>
                <Star className="w-3 h-3 text-yellow-500" />
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Recent Reviews</h4>
            {reviewsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={review.student?.avatar_url || '/placeholder.svg'}
                        alt={`${review.student?.first_name} ${review.student?.last_name}`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {review.student?.first_name} {review.student?.last_name}
                      </span>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseRatingDisplay;