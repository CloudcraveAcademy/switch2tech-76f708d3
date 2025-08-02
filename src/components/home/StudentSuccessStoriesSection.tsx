
import { User, Quote, Award, Briefcase } from "lucide-react";
import { useStudentSuccessStories } from "@/hooks/useStudentSuccessStories";
import { Skeleton } from "@/components/ui/skeleton";

const StudentSuccessStoriesSection = () => {
  const { data: stories, isLoading, error } = useStudentSuccessStories();

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-brand/10 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stories || stories.length === 0) {
    return (
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Student Success Stories</h2>
            <p className="max-w-2xl mx-auto text-lg text-white/80">
              Real stories from real students who transformed their careers with our guidance
            </p>
          </div>
          
          <div className="text-center text-white/60">
            <p>No success stories available at the moment.</p>
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
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="bg-brand/10 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={story.image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"} 
                  alt={story.name}
                  className="w-full h-full object-cover object-center"
                />
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
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-brand/20 text-white px-4 py-2 rounded-full">
            <Award className="h-5 w-5" />
            <span className="font-medium">Join 1,000+ successful career changers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentSuccessStoriesSection;
