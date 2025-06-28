
import { User, Quote, Award, Briefcase, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

const StudentSuccessStoriesSection = () => {
  const { data: featuredStories, isLoading } = useQuery({
    queryKey: ['featured-success-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_success_stories')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching featured stories:', error);
        throw error;
      }
      
      return data as StudentSuccessStory[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Student Success Stories</h2>
            <p className="max-w-2xl mx-auto text-lg text-white/80">
              Real stories from real students who transformed their careers with our guidance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-brand/10 rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-6"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-brand-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Student Success Stories</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/80">
            Real stories from real students who transformed their careers with our guidance
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {featuredStories?.map((story) => (
            <div 
              key={story.id} 
              className="bg-brand/10 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 relative overflow-hidden">
                {story.video_url ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={story.image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80`} 
                      alt={story.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={story.image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80`} 
                    alt={story.name}
                    className="w-full h-full object-cover object-center"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4 text-white/80">
                  <Quote className="h-6 w-6" />
                </div>
                <blockquote className="text-white mb-6 flex-grow italic">
                  "{story.story}"
                </blockquote>
                
                <div className="flex items-center border-t border-white/20 pt-4">
                  <div className="mr-4">
                    <User className="h-10 w-10 p-2 bg-brand/20 text-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">{story.name}</h3>
                    <div className="flex items-center text-sm text-white/80">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{story.role}</span>
                      <span className="mx-1">•</span>
                      <span>{story.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand/20 text-white px-4 py-2 rounded-full">
            <Award className="h-5 w-5" />
            <span className="font-medium">Join 1,000+ successful career changers</span>
          </div>
          <div>
            <Link 
              to="/success-stories" 
              className="inline-block text-brand hover:text-brand/80 font-medium underline"
            >
              View All Success Stories →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentSuccessStoriesSection;
