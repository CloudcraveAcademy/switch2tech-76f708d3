
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Megaphone, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AnnouncementFormState {
  title: string;
  content: string;
}

interface CourseAnnouncementProps {
  courseId: string;
}

interface Announcement {
  id: string;
  course_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function CourseAnnouncements({ courseId }: CourseAnnouncementProps) {
  const queryClient = useQueryClient();
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementFormState & { id: string } | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementFormState>({
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch announcements using the query key that includes the courseId
  const { data: announcements, isLoading, refetch } = useQuery<Announcement[]>({
    queryKey: ['course-announcements', courseId, refreshTrigger],
    queryFn: async () => {
      try {
        // Call the RPC function we created
        const { data, error } = await supabase.rpc('get_course_announcements', { 
          course_id_param: courseId 
        });

        if (error) {
          console.error("Error fetching announcements with RPC:", error);
          throw error;
        }
        
        return data as Announcement[] || [];
      } catch (e) {
        console.error("Error in query:", e);
        throw e;
      }
    },
    enabled: !!courseId && isMounted,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0  // Don't cache results
  });

  // Force refetch announcements when courseId changes
  useEffect(() => {
    if (courseId && isMounted) {
      refetch();
    }
  }, [courseId, refetch, isMounted, refreshTrigger]);

  const saveAnnouncement = async (announcement: AnnouncementFormState, id?: string) => {
    if (!announcement.title.trim() || !announcement.content.trim()) {
      toast({
        title: "Required fields missing",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (id) {
        // Update existing announcement
        const { data, error } = await supabase.rpc('update_course_announcement', {
          announcement_id_param: id,
          title_param: announcement.title,
          content_param: announcement.content
        });

        if (error) throw error;
        return data;
      } else {
        // Create new announcement
        const { data, error } = await supabase.rpc('create_course_announcement', {
          course_id_param: courseId,
          title_param: announcement.title,
          content_param: announcement.content
        });
        
        if (error) throw error;
        return data;
      }
    } catch (e) {
      console.error("Error saving announcement:", e);
      throw e;
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_course_announcement', {
        announcement_id_param: announcementId
      });
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error deleting announcement:", e);
      throw e;
    }
  };

  const mutation = useMutation({
    mutationFn: ({
      type,
      data,
      id,
    }: {
      type: "add" | "update" | "delete";
      data?: AnnouncementFormState;
      id?: string;
    }) => {
      if (type === "add" && data) return saveAnnouncement(data);
      if (type === "update" && id && data) return saveAnnouncement(data, id);
      if (type === "delete" && id) return deleteAnnouncement(id);
      return Promise.reject("Invalid operation");
    },
    onSuccess: () => {
      // Force refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['course-announcements', courseId] });
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Success",
        description: "Announcement updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || String(error),
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingAnnouncement) {
        await mutation.mutate({
          type: "update", 
          id: editingAnnouncement.id, 
          data: { 
            title: editingAnnouncement.title, 
            content: editingAnnouncement.content 
          }
        });
        setEditingAnnouncement(null);
      } else {
        await mutation.mutate({
          type: "add", 
          data: newAnnouncement
        });
        setNewAnnouncement({
          title: "",
          content: ""
        });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save announcement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <Input
            placeholder="Announcement Title"
            value={editingAnnouncement ? editingAnnouncement.title : newAnnouncement.title}
            onChange={e =>
              editingAnnouncement
                ? setEditingAnnouncement({
                    ...editingAnnouncement,
                    title: e.target.value,
                  })
                : setNewAnnouncement(n => ({
                    ...n,
                    title: e.target.value,
                  }))
            }
            required
          />
          
          <Textarea
            placeholder="Announcement Content"
            value={editingAnnouncement ? editingAnnouncement.content : newAnnouncement.content}
            onChange={e =>
              editingAnnouncement
                ? setEditingAnnouncement({
                    ...editingAnnouncement,
                    content: e.target.value,
                  })
                : setNewAnnouncement(n => ({
                    ...n,
                    content: e.target.value,
                  }))
            }
            required
            rows={3}
          />
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  {editingAnnouncement ? "Saving..." : "Posting..."}
                </>
              ) : editingAnnouncement ? (
                <>
                  <Edit className="mr-1 h-4 w-4" />
                  Update Announcement
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Post Announcement
                </>
              )}
            </Button>
            
            {editingAnnouncement && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAnnouncement(null)}
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
        ) : !announcements || announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <div>No announcements yet. Create your first announcement!</div>
          </div>
        ) : (
          <ul className="divide-y">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="py-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.created_at)}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="icon" 
                      variant="outline"
                      title="Edit" 
                      onClick={() => setEditingAnnouncement({
                        id: announcement.id,
                        title: announcement.title,
                        content: announcement.content
                      })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      title="Delete" 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this announcement?")) {
                          mutation.mutate({ 
                            type: "delete", 
                            id: announcement.id 
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
