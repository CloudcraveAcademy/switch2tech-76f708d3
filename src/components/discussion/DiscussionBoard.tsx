import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Send, Heart, Reply } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  discussion_board_id: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface DiscussionBoardProps {
  courseId: string;
  discussionBoardId?: string | null;
}

const DiscussionBoard = ({ courseId, discussionBoardId: externalDiscussionBoardId }: DiscussionBoardProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [discussionBoardId, setDiscussionBoardId] = useState<string | null>(null);

  const fetchOrCreateDiscussionBoard = async () => {
    try {
      // First, check if a discussion board exists for this course
      const { data: existingBoard, error: fetchError } = await supabase
        .from('discussion_boards')
        .select('id')
        .eq('course_id', courseId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingBoard) {
        setDiscussionBoardId(existingBoard.id);
        return existingBoard.id;
      }

      // Only instructors can create discussion boards
      // Students should use existing boards or request instructor to create one
      console.log("No discussion board found for this course");
      return null;
    } catch (error) {
      console.error("Error with discussion board:", error);
      return null;
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      let boardId = externalDiscussionBoardId;
      if (!boardId) {
        boardId = await fetchOrCreateDiscussionBoard();
      } else {
        setDiscussionBoardId(boardId);
      }
      
      if (!boardId) {
        setIsLoading(false);
        return;
      }

      const { data: postsData, error: postsError } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          user:user_profiles!user_id(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('discussion_board_id', boardId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);
    } catch (error) {
      console.error("Error fetching discussion posts:", error);
      toast({
        title: "Error loading discussions",
        description: "Unable to load discussion posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchPosts();
    }
  }, [courseId]);

  const handleSubmitPost = async () => {
    if (!user || !discussionBoardId || !newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      const { error } = await supabase
        .from('discussion_posts')
        .insert({
          discussion_board_id: discussionBoardId,
          user_id: user.id,
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
        });

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your discussion post has been published",
      });

      setNewPostTitle("");
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: "Unable to publish your discussion post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading discussions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Course Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Post - Only show if user is authenticated */}
        {user && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Start a new discussion</h3>
            <input
              type="text"
              placeholder="Discussion title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Textarea
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitPost} 
                disabled={isPosting || !newPostTitle.trim() || !newPostContent.trim()}
                className="flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        )}

        {/* Discussion Posts */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={post.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`}
                      alt="User avatar" 
                    />
                    <AvatarFallback>
                      {post.user?.first_name?.[0] || "U"}
                      {post.user?.last_name?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-lg">{post.title}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-medium text-sm">
                        {post.user?.first_name} {post.user?.last_name}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="mt-4 flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Heart className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No discussions yet</h3>
              <p className="text-gray-500 mb-4">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionBoard;