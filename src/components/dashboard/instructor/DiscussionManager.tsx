import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
}

interface DiscussionBoard {
  id: string;
  title: string;
  description: string;
  course_id: string;
  created_at: string;
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  discussion_board_id: string;
  created_at: string;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

const DiscussionManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionBoard[]>([]);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionBoard | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPostsDialogOpen, setIsPostsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [discussionForm, setDiscussionForm] = useState({
    title: "",
    description: "",
    course_id: ""
  });

  const fetchCourses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const fetchDiscussions = async () => {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('discussion_boards')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch discussions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`*`)
        .eq('discussion_board_id', discussionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts = data || [];
      const userIds = Array.from(new Set(posts.map((p: any) => p.user_id)));

      // Emails (instructor privileges)
      const emailMap: Record<string, string> = {};
      const { data: emailsData } = await supabase.rpc('get_user_emails', {
        user_ids: userIds,
        instructor_id: user?.id
      });
      if (Array.isArray(emailsData)) emailsData.forEach((row: any) => (emailMap[row.id] = row.email));

      // Names
      const profileMap: Record<string, { first_name?: string; last_name?: string }> = {};
      const results = await Promise.all(
        userIds.map((uid) => supabase.rpc('get_user_basic_info', { user_id_param: uid }))
      );
      results.forEach((res, idx) => {
        const uid = userIds[idx];
        const info = res.data?.[0] || {};
        profileMap[uid] = { first_name: info.first_name, last_name: info.last_name };
      });

      const postsWithProfiles = posts.map((post: any) => ({
        ...post,
        user_profiles: {
          first_name: profileMap[post.user_id]?.first_name || 'Unknown',
          last_name: profileMap[post.user_id]?.last_name || 'User',
          email: emailMap[post.user_id]
        }
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    }
  };

  const createDiscussion = async () => {
    if (!discussionForm.title || !discussionForm.course_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discussion_boards')
        .insert([discussionForm])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion board created successfully",
      });

      setIsCreateDialogOpen(false);
      setDiscussionForm({
        title: "",
        description: "",
        course_id: ""
      });
      fetchDiscussions();
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast({
        title: "Error",
        description: "Failed to create discussion board",
        variant: "destructive",
      });
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    if (!confirm("Are you sure you want to delete this discussion board? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('discussion_boards')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion board deleted successfully",
      });

      fetchDiscussions();
    } catch (error) {
      console.error("Error deleting discussion:", error);
      toast({
        title: "Error",
        description: "Failed to delete discussion board",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('discussion_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      fetchPosts(selectedDiscussion!.id);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchDiscussions();
    }
  }, [selectedCourse]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussion Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Discussion Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discussion Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={discussionForm.course_id}
                  onValueChange={(value) => setDiscussionForm({ ...discussionForm, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Discussion Title</Label>
                <Input
                  id="title"
                  value={discussionForm.title}
                  onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                  placeholder="Enter discussion title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={discussionForm.description}
                  onChange={(e) => setDiscussionForm({ ...discussionForm, description: e.target.value })}
                  placeholder="Enter discussion description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createDiscussion}>Create Discussion Board</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Label htmlFor="course-select">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose a course to manage discussions" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <div className="grid gap-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {discussion.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDiscussion(discussion);
                        fetchPosts(discussion.id);
                        setIsPostsDialogOpen(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Posts
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDiscussion(discussion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{discussion.description}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(discussion.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}

          {discussions.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No discussion boards found for this course.</p>
                  <p className="text-muted-foreground">Create your first discussion board to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Posts Dialog */}
      <Dialog open={isPostsDialogOpen} onOpenChange={setIsPostsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDiscussion?.title} - Posts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By: {`${post.user_profiles?.first_name || ''} ${post.user_profiles?.last_name || ''}`.trim() || 'Unknown User'}
                      </p>
                      {(post.user_profiles as any)?.email && (
                        <p className="text-xs text-muted-foreground">{(post.user_profiles as any).email}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Posted: {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm bg-gray-50 p-3 rounded">{post.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet in this discussion.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscussionManager;