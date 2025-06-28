
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { User, Quote, Briefcase, Play, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentSuccessStory {
  id: string;
  name: string;
  story: string;
  role: string;
  company: string;
  image_url: string | null;
  video_url: string | null;
  is_featured: boolean;
  created_at: string;
}

const SuccessStories = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['all-success-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_success_stories')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching stories:', error);
        throw error;
      }
      
      return data as StudentSuccessStory[];
    }
  });

  const handleVideoPlay = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how our students transformed their careers and achieved their dreams
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-20 bg-gray-300 rounded mb-6"></div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover how our students transformed their careers and achieved their dreams
            </p>
            <Link to="/submit-success-story">
              <Button className="bg-brand hover:bg-brand/90">
                <Plus className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            </Link>
          </div>

          {/* Stories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories?.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 relative overflow-hidden">
                  {story.video_url ? (
                    <div 
                      className="relative w-full h-full cursor-pointer group"
                      onClick={() => handleVideoPlay(story.video_url!)}
                    >
                      <img 
                        src={story.image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80`} 
                        alt={story.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={story.image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80`} 
                      alt={story.name}
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {story.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4 text-gray-500">
                    <Quote className="h-5 w-5" />
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic line-clamp-4">
                    "{story.story}"
                  </blockquote>
                  
                  <div className="flex items-center border-t border-gray-200 pt-4">
                    <div className="mr-4">
                      <User className="h-10 w-10 p-2 bg-brand/10 text-brand rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{story.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-3 w-3 mr-1" />
                        <span>{story.role}</span>
                        <span className="mx-1">•</span>
                        <span>{story.company}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {stories?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No success stories available yet.</p>
              <Link to="/submit-success-story">
                <Button className="bg-brand hover:bg-brand/90">
                  Be the first to share your story!
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="relative max-w-4xl w-full">
              <video 
                src={selectedVideo} 
                controls 
                autoPlay 
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuccessStories;
