
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Plus, Edit, Trash2, Move } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  order_number: number;
  duration_minutes: number;
  content: string;
  video_url?: string | null;
}

interface LessonFormState {
  title: string;
  duration_minutes: string; // Always a string in form
  content: string;
  video_url?: string | null;
}

interface CurriculumManagerProps {
  courseId: string;
  onLessonAdded?: () => void;
}

export function CurriculumManager({ courseId, onLessonAdded }: CurriculumManagerProps) {
  const queryClient = useQueryClient();
  const [editingLesson, setEditingLesson] = useState<(LessonFormState & { id: string; course_id: string; order_number: number }) | null>(null);
  const [newLesson, setNewLesson] = useState<LessonFormState>({
    title: "",
    duration_minutes: "",
    content: "",
    video_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentCourseInstructor, setCurrentCourseInstructor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user id
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
        console.log("Current user ID:", data.user.id);
      }
    });

    // Fetch course instructor id
    if (courseId) {
      supabase
        .from("courses")
        .select("instructor_id, title")
        .eq("id", courseId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data?.instructor_id) {
            setCurrentCourseInstructor(data.instructor_id);
            console.log("Course instructor ID:", data.instructor_id, "Course title:", data.title);
          }
          if (error) {
            console.error("Error fetching course:", error);
            toast({
              title: "Error",
              description: "Could not fetch course details",
              variant: "destructive"
            });
          }
        });
    }
  }, [courseId]);

  const { data: lessons, isLoading, error, refetch } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      console.log("Fetching lessons for courseId:", courseId);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_number", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
        setErrorMessage(`Fetch error: ${error.message}`);
        toast({
          title: "Error",
          description: `Could not load lessons: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      console.log("Fetched lessons:", data);
      return data || [];
    },
    enabled: !!courseId,
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lesson: LessonFormState) => {
      try {
        // Verify permissions
        if (currentUserId !== currentCourseInstructor) {
          throw new Error("Only the course instructor can add lessons");
        }

        const duration = Number(lesson.duration_minutes);
        
        if (isNaN(duration) || duration <= 0) {
          throw new Error("Duration must be a positive number");
        }

        // Get current highest order number
        const { data: currentLessons } = await supabase
          .from("lessons")
          .select("order_number")
          .eq("course_id", courseId)
          .order("order_number", { ascending: false });
          
        const nextOrder = currentLessons?.length ? (currentLessons[0]?.order_number || 0) + 1 : 1;
        
        // Insert new lesson
        const { data, error } = await supabase
          .from("lessons")
          .insert({
            course_id: courseId,
            title: lesson.title,
            duration_minutes: duration,
            content: lesson.content || "",
            video_url: lesson.video_url || null,
            order_number: nextOrder,
          })
          .select();
          
        if (error) {
          console.error("Insert error:", error);
          throw new Error(`Failed to add lesson: ${error.message}`);
        }
        
        return data;
      } catch (error: any) {
        console.error("Error saving lesson:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lesson added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      if (onLessonAdded) onLessonAdded();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: async (lesson: LessonFormState & { id: string }) => {
      const duration = Number(lesson.duration_minutes);
      
      if (isNaN(duration) || duration <= 0) {
        throw new Error("Duration must be a positive number");
      }
      
      const { error } = await supabase
        .from("lessons")
        .update({
          title: lesson.title,
          duration_minutes: duration,
          content: lesson.content || "",
          video_url: lesson.video_url || null,
        })
        .eq("id", lesson.id);
        
      if (error) {
        console.error("Update error:", error);
        throw new Error(`Failed to update lesson: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lesson updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lesson",
        variant: "destructive"
      });
    }
  });

  const moveLesson = async (direction: "up" | "down", idx: number) => {
    if (!lessons || !lessons.length) return;
    
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    
    try {
      const lesson1 = lessons[idx];
      const lesson2 = lessons[targetIdx];
      
      // Swap order numbers
      await supabase.from("lessons").update({ order_number: lesson2.order_number }).eq("id", lesson1.id);
      await supabase.from("lessons").update({ order_number: lesson1.order_number }).eq("id", lesson2.id);
      
      toast({
        title: "Success",
        description: "Lesson order updated"
      });
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
    } catch (error: any) {
      console.error("Error moving lesson:", error);
      toast({
        title: "Error",
        description: "Failed to reorder lessons",
        variant: "destructive"
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      
      if (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: `Failed to delete lesson: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Lesson deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete lesson",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingLesson) {
        await updateLessonMutation.mutateAsync({
          id: editingLesson.id,
          title: editingLesson.title,
          duration_minutes: editingLesson.duration_minutes,
          content: editingLesson.content,
          video_url: editingLesson.video_url
        });
        setEditingLesson(null);
      } else {
        await createLessonMutation.mutateAsync(newLesson);
        setNewLesson({
          title: "",
          duration_minutes: "",
          content: "",
          video_url: "",
        });
      }
    } catch (error) {
      console.error("Form submit error:", error);
      // Error handling is done in mutation callbacks
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum</CardTitle>
        <div className="text-gray-500 text-sm">
          Add, update, or reorder course lessons. These represent the curriculum students follow.
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Debug - Course ID:", courseId);
              console.log("Debug - Current user:", currentUserId);
              console.log("Debug - Course instructor:", currentCourseInstructor);
              console.log("Debug - Lessons:", lessons);
              console.log("Debug - Error state:", error);
              console.log("Debug - Error message:", errorMessage);
              toast({
                title: "Debug Info",
                description: "Debug information printed to console"
              });
              
              // Force a refetch to try again
              refetch();
            }}
          >
            Debug Info
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="Lesson Title"
            value={editingLesson ? editingLesson.title : newLesson.title}
            onChange={(e) =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    title: e.target.value,
                  })
                : setNewLesson((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
            }
            required
          />
          <Input
            placeholder="Duration (minutes)"
            type="number"
            min={1}
            value={editingLesson ? editingLesson.duration_minutes : newLesson.duration_minutes}
            onChange={(e) =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    duration_minutes: e.target.value,
                  })
                : setNewLesson((prev) => ({
                    ...prev,
                    duration_minutes: e.target.value,
                  }))
            }
            required
          />
          <Textarea
            placeholder="Lesson Content"
            className="col-span-2"
            value={editingLesson ? editingLesson.content : newLesson.content}
            onChange={(e) =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    content: e.target.value,
                  })
                : setNewLesson((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
            }
            required
            rows={3}
          />
          <Input
            placeholder="Video URL (optional)"
            className="col-span-2"
            value={editingLesson ? editingLesson.video_url || "" : newLesson.video_url || ""}
            onChange={(e) =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    video_url: e.target.value,
                  })
                : setNewLesson((prev) => ({
                    ...prev,
                    video_url: e.target.value,
                  }))
            }
          />
          <div className="col-span-2 flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || (currentUserId !== currentCourseInstructor)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  {editingLesson ? "Saving..." : "Adding..."}
                </>
              ) : editingLesson ? (
                <>
                  <Edit className="mr-1 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Lesson
                </>
              )}
            </Button>
            {editingLesson && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLesson(null)}
                disabled={isSubmitting}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : !lessons?.length ? (
          <div className="text-gray-500 py-8 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <div>
              No lessons yet. Add lessons to build your curriculum.
              <div className="mt-2 text-xs text-blue-500">courseId: {courseId}</div>
              <div className="text-xs text-blue-500 mt-1">
                User/Instructor check: {currentUserId === currentCourseInstructor 
                  ? "You are the instructor"
                  : "You are not the instructor"
                }
              </div>
              {errorMessage && (
                <div className="text-xs text-red-500 mt-1">{errorMessage}</div>
              )}
            </div>
          </div>
        ) : (
          <ul>
            {lessons.map((lesson, idx) => (
              <li
                key={lesson.id}
                className="mb-3 flex items-center gap-2 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="font-semibold">
                    {lesson.order_number}. {lesson.title}{" "}
                    <span className="text-xs text-gray-400 ml-2">
                      {lesson.duration_minutes ?? 0} min
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {lesson.content}
                  </div>
                  {lesson.video_url && (
                    <div className="text-xs mt-1 text-blue-700 truncate">
                      Video: {lesson.video_url}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Move up"
                  disabled={idx === 0}
                  onClick={() => moveLesson("up", idx)}
                >
                  <Move className="rotate-180 h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Move down"
                  disabled={idx === lessons.length - 1}
                  onClick={() => moveLesson("down", idx)}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  title="Edit"
                  disabled={currentUserId !== currentCourseInstructor}
                  onClick={() =>
                    setEditingLesson({
                      ...lesson,
                      duration_minutes: String(lesson.duration_minutes ?? ""),
                    })
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  title="Delete"
                  disabled={currentUserId !== currentCourseInstructor}
                  onClick={() => deleteLesson(lesson.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
