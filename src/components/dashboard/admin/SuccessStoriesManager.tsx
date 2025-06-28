
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Star, 
  StarOff, 
  Eye, 
  Calendar,
  User,
  Briefcase 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StudentSuccessStory {
  id: string;
  name: string;
  story: string;
  role: string;
  company: string;
  image_url: string | null;
  video_url: string | null;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  submitted_by: string | null;
}

const SuccessStoriesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<StudentSuccessStory | null>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['admin-success-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_success_stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching stories:', error);
        throw error;
      }
      
      return data as StudentSuccessStory[];
    }
  });

  const approveStoryMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase
        .from('student_success_stories')
        .update({ 
          is_approved: approve,
          approved_at: approve ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['all-success-stories'] });
      toast({
        title: approve ? "Story Approved" : "Story Rejected",
        description: approve 
          ? "Success story has been approved and is now visible to users."
          : "Success story has been rejected and is no longer visible.",
      });
    },
    onError: (error) => {
      console.error('Error updating story:', error);
      toast({
        title: "Error",
        description: "Failed to update story status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('student_success_stories')
        .update({ is_featured: featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-success-stories'] });
      toast({
        title: featured ? "Story Featured" : "Story Unfeatured",
        description: featured 
          ? "This story will now appear in the featured section on the homepage."
          : "This story has been removed from the featured section.",
      });
    },
    onError: (error) => {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (id: string) => {
    approveStoryMutation.mutate({ id, approve: true });
  };

  const handleReject = (id: string) => {
    approveStoryMutation.mutate({ id, approve: false });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured: !currentFeatured });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Success Stories Management</h2>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-20 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingStories = stories?.filter(story => !story.is_approved) || [];
  const approvedStories = stories?.filter(story => story.is_approved) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Success Stories Management</h2>
        <p className="text-gray-600">
          Review and manage student success stories. Approve stories to make them visible to users.
        </p>
      </div>

      {/* Pending Stories */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Pending Approval 
          {pendingStories.length > 0 && (
            <Badge variant="secondary">{pendingStories.length}</Badge>
          )}
        </h3>
        
        {pendingStories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No stories pending approval.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingStories.map((story) => (
              <Card key={story.id} className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{story.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          <span>{story.role} at {story.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {new Date(story.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">"{story.story}"</p>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStory(story)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Success Story</DialogTitle>
                          <DialogDescription>
                            Review the full story before approving or rejecting.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedStory && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                {selectedStory.image_url ? (
                                  <img 
                                    src={selectedStory.image_url} 
                                    alt={selectedStory.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-8 w-8 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">{selectedStory.name}</h4>
                                <p className="text-gray-600">{selectedStory.role} at {selectedStory.company}</p>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Story:</h5>
                              <p className="text-gray-700 whitespace-pre-wrap">"{selectedStory.story}"</p>
                            </div>
                            {selectedStory.video_url && (
                              <div>
                                <h5 className="font-medium mb-2">Video:</h5>
                                <video src={selectedStory.video_url} controls className="w-full max-h-64" />
                              </div>
                            )}
                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={() => handleApprove(selectedStory.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleReject(selectedStory.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(story.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(story.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved Stories */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Approved Stories 
          {approvedStories.length > 0 && (
            <Badge variant="secondary">{approvedStories.length}</Badge>
          )}
        </h3>
        
        <div className="grid gap-4">
          {approvedStories.map((story) => (
            <Card key={story.id} className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {story.image_url ? (
                        <img 
                          src={story.image_url} 
                          alt={story.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{story.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{story.role} at {story.company}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {story.is_featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">"{story.story}"</p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleFeatured(story.id, story.is_featured)}
                  >
                    {story.is_featured ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Feature
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(story.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Unapprove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesManager;
