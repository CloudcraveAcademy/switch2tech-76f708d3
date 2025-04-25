import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Plus, Edit, Trash2, Move } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

export function CurriculumManager({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const [editingLesson, setEditingLesson] = useState<(LessonFormState & { id: string; course_id: string; order_number: number }) | null>(null);
  const [newLesson, setNewLesson] = useState<LessonFormState>({
    title: "",
    duration_minutes: "",
    content: "",
    video_url: "",
  });
  const [reordering, setReordering] = useState(false);

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_number", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
        toast.error(error.message || "Could not load lessons");
        throw error;
      }

      console.log("Fetched lessons:", data);
      return data || [];
    },
    enabled: !!courseId,
  });

  const saveLesson = async (
    lesson: LessonFormState,
    id?: string
  ) => {
    const duration = Number(lesson.duration_minutes);
    if (!lesson.title.trim() || !lesson.duration_minutes || isNaN(duration)) {
      toast.error("Title and a valid duration are required");
      throw new Error("Title and valid duration are required");
    }
    if (id) {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: lesson.title,
          duration_minutes: duration,
          content: lesson.content,
          video_url: lesson.video_url,
        })
        .eq("id", id);
      if (error) {
        console.error("Error updating lesson:", error);
        toast.error(error.message || "Could not update lesson");
        throw error;
      }
      toast.success("Lesson updated!");
    } else {
      const { data: currentLessons, error: orderErr } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_number", { ascending: true });
      if (orderErr) {
        console.error("Error fetching lessons for order:", orderErr);
        toast.error(orderErr.message || "Could not determine lesson order");
        throw orderErr;
      }
      const nextOrder = currentLessons ? currentLessons.length + 1 : 1;
      const { error, data } = await supabase.from("lessons").insert({
        course_id: courseId,
        title: lesson.title,
        duration_minutes: duration,
        content: lesson.content,
        video_url: lesson.video_url,
        order_number: nextOrder,
      });
      if (error) {
        console.error("Error adding lesson:", error);
        toast.error(error.message || "Could not add lesson");
        throw error;
      }
      if (!data) {
        toast.error("Failed to add lesson: No data returned");
      } else {
        console.log("Lesson added:", data);
        toast.success("Lesson added!");
      }
    }
    queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
  };

  const deleteLesson = async (lessonId: string) => {
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
  };

  const moveLesson = async (direction: "up" | "down", idx: number) => {
    if (!lessons) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const l1 = lessons[idx];
    const l2 = lessons[targetIdx];
    const { error: err1 } = await supabase
      .from("lessons")
      .update({ order_number: l2.order_number })
      .eq("id", l1.id);
    const { error: err2 } = await supabase
      .from("lessons")
      .update({ order_number: l1.order_number })
      .eq("id", l2.id);
    if (err1 || err2) throw err1 || err2;
    queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
  };

  const mutation = useMutation({
    mutationFn: ({
      type,
      data,
      id,
      idx,
      direction,
    }: {
      type: "add" | "update" | "delete" | "move";
      data?: any;
      id?: string;
      idx?: number;
      direction?: "up" | "down";
    }) => {
      if (type === "add") return saveLesson(data);
      if (type === "update" && id) return saveLesson(data, id);
      if (type === "delete" && id) return deleteLesson(id);
      if (type === "move" && idx !== undefined && direction)
        return moveLesson(direction, idx);
      return Promise.reject();
    },
    onSuccess: () => {},
    onError: (error: any) => {
      toast.error(error.message || String(error));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum</CardTitle>
        <div className="text-gray-500 text-sm">
          Add, update, or reorder course lessons. These represent the curriculum students follow.
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          onSubmit={e => {
            e.preventDefault();
            if (editingLesson) {
              const { id, course_id, order_number, ...lessonData } = editingLesson;
              saveLesson(lessonData, editingLesson.id)
                .then(() => setEditingLesson(null))
                .catch(() => {});
            } else {
              saveLesson(newLesson)
                .then(() =>
                  setNewLesson({
                    title: "",
                    duration_minutes: "",
                    content: "",
                    video_url: "",
                  })
                )
                .catch(() => {});
            }
          }}
        >
          <Input
            placeholder="Lesson Title"
            value={editingLesson ? editingLesson.title : newLesson.title}
            onChange={e =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    title: e.target.value,
                  })
                : setNewLesson(n => ({
                    ...n,
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
            onChange={e =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    duration_minutes: e.target.value,
                  })
                : setNewLesson(n => ({
                    ...n,
                    duration_minutes: e.target.value,
                  }))
            }
            required
          />
          <Textarea
            placeholder="Lesson Content"
            className="col-span-2"
            value={editingLesson ? editingLesson.content : newLesson.content}
            onChange={e =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    content: e.target.value,
                  })
                : setNewLesson(n => ({
                    ...n,
                    content: e.target.value,
                  }))
            }
            required
            rows={3}
          />
          <Input
            placeholder="Video URL (optional)"
            className="col-span-2"
            value={editingLesson ? editingLesson.video_url || "" : newLesson.video_url}
            onChange={e =>
              editingLesson
                ? setEditingLesson({
                    ...editingLesson,
                    video_url: e.target.value,
                  })
                : setNewLesson(n => ({
                    ...n,
                    video_url: e.target.value,
                  }))
            }
          />
          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {editingLesson ? (
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
        ) : !lessons || lessons.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            No lessons yet. Add lessons to build your curriculum.
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
                  onClick={() =>
                    mutation.mutate({ type: "move", idx, direction: "up" })
                  }
                >
                  <Move className="rotate-180 h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Move down"
                  disabled={idx === lessons.length - 1}
                  onClick={() =>
                    mutation.mutate({ type: "move", idx, direction: "down" })
                  }
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  title="Edit"
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
                  onClick={() =>
                    mutation.mutate({ type: "delete", id: lesson.id })
                  }
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
