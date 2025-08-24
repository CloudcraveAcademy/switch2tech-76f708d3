import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Trash2, Search, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Rating {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  course: {
    title: string;
    id: string;
  };
  student: {
    first_name: string;
    last_name: string;
    id: string;
  };
}

const RatingsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteRatingId, setDeleteRatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ratings, isLoading } = useQuery({
    queryKey: ['admin-ratings', searchTerm],
    queryFn: async (): Promise<Rating[]> => {
      let query = supabase
        .from('course_ratings')
        .select(`
          *,
          course:courses!course_id (
            title,
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`course.title.ilike.%${searchTerm}%,student.first_name.ilike.%${searchTerm}%,student.last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch student profiles for each rating
      const ratingsWithProfiles = await Promise.all(
        (data || []).map(async (rating: any) => {
          const { data: studentProfile, error: profileError } = await supabase.rpc('get_user_basic_info', { 
            user_id_param: rating.student_id 
          });
          
          return {
            ...rating,
            student: studentProfile?.[0] || { first_name: 'Unknown', last_name: 'Student', id: rating.student_id }
          };
        })
      );
      
      return ratingsWithProfiles as Rating[];
    },
    staleTime: 30000,
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      const { error } = await supabase
        .from('course_ratings')
        .delete()
        .eq('id', ratingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ratings'] });
      toast({
        title: "Rating deleted",
        description: "The rating has been successfully removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting rating",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleDeleteRating = (ratingId: string) => {
    setDeleteRatingId(ratingId);
  };

  const confirmDelete = () => {
    if (deleteRatingId) {
      deleteRatingMutation.mutate(deleteRatingId);
      setDeleteRatingId(null);
    }
  };

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ratings Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by course title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading ratings...</div>
          ) : !ratings || ratings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No ratings found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div className="font-medium">
                          {rating.course?.title || 'Unknown Course'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rating.student?.first_name} {rating.student?.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.rating)}
                          <span className="text-sm font-medium">
                            {rating.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {rating.review ? (
                          <div className="truncate" title={rating.review}>
                            {rating.review}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No review</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteRating(rating.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Rating
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRatingId} onOpenChange={() => setDeleteRatingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rating? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RatingsManager;