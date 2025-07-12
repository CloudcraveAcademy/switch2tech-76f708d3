import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { DiscussionBoard } from "@/components/discussion";

interface DiscussionBoardData {
  id: string;
  title: string;
  description: string;
  course_id: string;
  created_at: string;
}

interface DiscussionListProps {
  courseId: string;
}

const DiscussionList = ({ courseId }: DiscussionListProps) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<DiscussionBoardData[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_boards')
        .select('*')
        .eq('course_id', courseId)
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

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading discussions...</div>
        </CardContent>
      </Card>
    );
  }

  // If a specific discussion is selected, show the discussion board
  if (selectedDiscussion) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedDiscussion(null)}
        >
          ← Back to Discussions
        </Button>
        <DiscussionBoard courseId={courseId} discussionBoardId={selectedDiscussion} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Course Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{discussion.title}</h3>
                        <p className="text-muted-foreground mt-1">{discussion.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Created: {new Date(discussion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedDiscussion(discussion.id)}
                        className="ml-4"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Join Discussion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No discussions available</h3>
              <p className="text-gray-500">Your instructor hasn't created any discussion boards yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionList;