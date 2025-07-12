import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CourseRatingProps {
  courseId: string;
  isEnrolled: boolean;
  currentRating?: {
    rating: number;
    review?: string;
  };
}

const CourseRating: React.FC<CourseRatingProps> = ({
  courseId,
  isEnrolled,
  currentRating
}) => {
  const [rating, setRating] = useState(currentRating?.rating || 0);
  const [review, setReview] = useState(currentRating?.review || "");
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const ratingData = {
        course_id: courseId,
        student_id: user.user.id,
        rating,
        review: review.trim() || null
      };

      if (currentRating) {
        // Update existing rating
        const { error } = await supabase
          .from('course_ratings')
          .update(ratingData)
          .eq('course_id', courseId)
          .eq('student_id', user.user.id);
        
        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('course_ratings')
          .insert(ratingData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-rating', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-rating-stats', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-course-rating', courseId] });
      
      toast({
        title: "Rating submitted successfully",
        description: "Thank you for your feedback!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting rating",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star",
        variant: "destructive"
      });
      return;
    }
    submitRatingMutation.mutate();
  };

  if (!isEnrolled) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate This Course</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <Textarea
          placeholder="Write a review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={500}
          className="min-h-[100px]"
        />
        <div className="text-xs text-gray-500 text-right">
          {review.length}/500 characters
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={rating === 0 || submitRatingMutation.isPending}
          className="w-full"
        >
          {submitRatingMutation.isPending 
            ? "Submitting..." 
            : currentRating 
            ? "Update Rating" 
            : "Submit Rating"
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseRating;