import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote, User, Briefcase, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { StudentSuccessStory } from "@/hooks/useStudentSuccessStories";
import { normalizeImageUrl } from "@/utils/imageUrl";


const useAllApprovedStories = () =>
  useQuery({
    queryKey: ["student-success-stories", "all-approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_success_stories")
        .select("*")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StudentSuccessStory[];
    },
  });

const StoryCard = ({ story }: { story: StudentSuccessStory }) => {
  const src = normalizeImageUrl(story.image_url);
  return (
  <article className="bg-brand/10 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
    <div className="h-56 relative overflow-hidden bg-brand/20">
      {src && (
        <img
          src={src}
          alt={story.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="w-full h-full object-cover object-center"
        />
      )}
      {story.is_featured && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
          <Star className="h-3 w-3" /> Featured
        </span>
      )}
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <Quote className="h-6 w-6 text-white/70 mb-4" />
      <blockquote className="text-white mb-6 flex-grow italic">"{story.story}"</blockquote>
      <div className="flex items-center border-t border-white/20 pt-4">
        <User className="h-10 w-10 p-2 bg-brand/20 text-white rounded-full mr-4" />
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
  </article>
);

const SuccessStories = () => {
  const { user } = useAuth();
  const { data: stories, isLoading, error } = useAllApprovedStories();

  return (
    <Layout>
      <section className="py-20 bg-brand-dark min-h-screen">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Student Success Stories
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/80">
              Real stories from real students who transformed their careers with Switch2Tech.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to={user ? "/dashboard/share-story" : "/login"}>
                  Share Your Story
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-xl" />
              ))}
            </div>
          ) : error || !stories || stories.length === 0 ? (
            <div className="text-center text-white/60 py-16">
              <p>No success stories to display yet. Be the first to share yours!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-brand/20 text-white px-4 py-2 rounded-full">
              <Award className="h-5 w-5" />
              <span className="font-medium">Join 1,000+ successful career changers</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SuccessStories;
