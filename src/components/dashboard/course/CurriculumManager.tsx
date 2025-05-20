
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, FileText, Video, Clock, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
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

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_number: number;
  course_id: string;
  created_at: string;
  updated_at: string;
}

interface CurriculumManagerProps {
  courseId?: string;
  onLessonAdded?: () => void;
  isActive: (path: string) => boolean;
}

const CurriculumManager: React.FC<CurriculumManagerProps> = ({ courseId, onLessonAdded }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

  const fetchLessons = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_number', { ascending: true });

      if (error) {
        throw error;
      }

      setLessons(data || []);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      setError(err.message || 'Failed to load lessons');
      toast({
        title: "Error",
        description: "Failed to load curriculum",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLesson = () => {
    navigate(`/dashboard/courses/${courseId}/lessons/new`);
  };

  const handleEditLesson = (lessonId: string) => {
    navigate(`/dashboard/courses/${courseId}/lessons/${lessonId}/edit`);
  };

  const confirmDeleteLesson = (lesson: Lesson) => {
    setLessonToDelete(lesson);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });

      // Re-fetch lessons to update the list
      fetchLessons();
      
      // Close dialog
      setLessonToDelete(null);
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorderLessons = async (lessonId: string, newOrder: number) => {
    if (newOrder < 1 || newOrder > lessons.length) return;
    
    setIsReordering(true);
    try {
      // Find the lessons that need to be updated
      const lessonToMove = lessons.find(l => l.id === lessonId);
      if (!lessonToMove) return;
      
      const currentOrder = lessonToMove.order_number;
      
      // Update the moved lesson
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ order_number: newOrder })
        .eq('id', lessonId);
        
      if (updateError) throw updateError;
      
      // Update other affected lessons
      if (newOrder > currentOrder) {
        // Moving down - decrement lessons in between
        for (const lesson of lessons) {
          if (lesson.order_number > currentOrder && lesson.order_number <= newOrder && lesson.id !== lessonId) {
            await supabase
              .from('lessons')
              .update({ order_number: lesson.order_number - 1 })
              .eq('id', lesson.id);
          }
        }
      } else if (newOrder < currentOrder) {
        // Moving up - increment lessons in between
        for (const lesson of lessons) {
          if (lesson.order_number >= newOrder && lesson.order_number < currentOrder && lesson.id !== lessonId) {
            await supabase
              .from('lessons')
              .update({ order_number: lesson.order_number + 1 })
              .eq('id', lesson.id);
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Lesson order updated",
      });
      
      // Re-fetch to update the list
      fetchLessons();
    } catch (err: any) {
      console.error('Error reordering lessons:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to reorder lessons",
        variant: "destructive",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const moveLesson = (lessonId: string, direction: 'up' | 'down') => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const currentOrder = lesson.order_number;
    let newOrder;
    
    if (direction === 'up' && currentOrder > 1) {
      newOrder = currentOrder - 1;
    } else if (direction === 'down' && currentOrder < lessons.length) {
      newOrder = currentOrder + 1;
    } else {
      return; // Can't move beyond boundaries
    }
    
    handleReorderLessons(lessonId, newOrder);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-2/3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={fetchLessons}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No lessons have been added to this course yet.</p>
            <Button onClick={handleAddLesson}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center bg-gray-100 h-8 w-8 rounded-full mr-3">
                        <span className="text-sm font-medium">{lesson.order_number}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1 space-x-3">
                          {lesson.video_url && (
                            <div className="flex items-center">
                              <Video className="h-3.5 w-3.5 mr-1" />
                              <span>Video</span>
                            </div>
                          )}
                          {lesson.content && (
                            <div className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              <span>Content</span>
                            </div>
                          )}
                          {lesson.duration_minutes && (
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveLesson(lesson.id, 'up')}
                      disabled={lesson.order_number === 1 || isReordering}
                      className="h-8 w-8"
                    >
                      <ArrowDownUp className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveLesson(lesson.id, 'down')}
                      disabled={lesson.order_number === lessons.length || isReordering}
                      className="h-8 w-8"
                    >
                      <ArrowDownUp className="h-4 w-4 -rotate-90" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditLesson(lesson.id)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => confirmDeleteLesson(lesson)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-center mt-6">
            <Button onClick={handleAddLesson}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Lesson
            </Button>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={() => !isDeleting && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the lesson "{lessonToDelete?.title}" and all its content. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteLesson();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurriculumManager;
