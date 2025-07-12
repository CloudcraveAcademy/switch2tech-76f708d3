import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Users, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DiscussionBoard {
  id: string;
  title: string;
  description: string;
  course_id: string;
  created_at: string;
  courses: {
    title: string;
    instructor_id: string;
    user_profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

const DiscussionOverview = () => {
  const [discussions, setDiscussions] = useState<DiscussionBoard[]>([]);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionBoard | null>(null);
  const [isPostsDialogOpen, setIsPostsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_boards')
        .select(`
          *,
          courses (
            title,
            instructor_id,
            user_profiles!instructor_id (
              first_name,
              last_name
            )
          )
        `)
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
        .select(`
          *,
          user_profiles!user_id (
            first_name,
            last_name
          )
        `)
        .eq('discussion_board_id', discussionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
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

  useEffect(() => {
    fetchDiscussions();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading discussions...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussion Overview</h1>
        <div className="text-sm text-muted-foreground">
          {discussions.length} total discussion boards
        </div>
      </div>

      <div className="grid gap-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {discussion.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Course: {discussion.courses?.title} | 
                    Instructor: {`${discussion.courses?.user_profiles?.first_name || ''} ${discussion.courses?.user_profiles?.last_name || ''}`.trim() || 'Unknown'}
                  </p>
                </div>
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
                <p className="text-muted-foreground">No discussion boards found in the system.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

export default DiscussionOverview;