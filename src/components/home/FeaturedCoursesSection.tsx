
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { ArrowRight, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discounted_price?: number;
  level: "beginner" | "intermediate" | "advanced";
  rating: number;
  reviews: number;
  mode: "self-paced" | "virtual" | "live"; 
  enrolledStudents: number;
  lessons: number;
  instructor: {
    id?: string;
    name: string;
    avatar: string | null;
  };
  category: string;
  image: string;
  featured: boolean;
  tags: string[];
  duration: string;
};

// Helper function to safely cast level
const parseLevel = (level: string | null): "beginner" | "intermediate" | "advanced" => {
  if (level === "intermediate" || level === "advanced") {
    return level;
  }
  return "beginner"; // default fallback
};

// Helper function to safely cast mode
const parseMode = (mode: string | null): "self-paced" | "virtual" | "live" => {
  if (mode === "virtual" || mode === "live") {
    return mode;
  }
  return "self-paced"; // default fallback
};

const FeaturedCoursesSection = () => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      console.log("Fetching featured courses...");
      
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(`
            *,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw coursesError;
        }

        console.log("Fetched courses data:", coursesData?.length || 0, "courses");

        if (!coursesData || coursesData.length === 0) {
          console.log("No courses found, returning empty array");
          return [];
        }

        const transformedCourses: Course[] = coursesData.map(course => ({
          id: course.id,
          title: course.title || "Untitled Course",
          description: course.description,
          price: Number(course.price) || 0,
          discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
          level: parseLevel(course.level),
          rating: 4.5,
          reviews: 42,
          mode: parseMode(course.mode),
          enrolledStudents: 156,
          lessons: 8,
          instructor: {
            id: course.instructor_id,
            name: course.instructor ? 
              `${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`.trim() || 'Instructor' 
              : 'Instructor',
            avatar: "/placeholder.svg"
          },
          category: "Technology",
          image: course.image_url || "/placeholder.svg",
          featured: true,
          tags: [],
          duration: course.duration_hours ? `${course.duration_hours}h` : "10h",
        }));

        console.log("Successfully transformed", transformedCourses.length, "courses");
        return transformedCourses;
      } catch (error) {
        console.error("Course fetch failed:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold">FEATURED COURSES</span>
            <h2 className="text-4xl font-bold mt-2 mb-6 text-foreground">
              Learn From Industry Experts
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore our most popular courses designed to help you build practical skills 
              and advance your career.
            </p>
          </div>
          <div className="flex justify-center py-12">
            <Loader className="animate-spin h-10 w-10 text-brand-500" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Course loading error:", error);
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold">FEATURED COURSES</span>
            <h2 className="text-4xl font-bold mt-2 mb-6 text-foreground">
              Learn From Industry Experts
            </h2>
          </div>
          <div className="text-center text-destructive py-12">
            <p className="mb-4">Unable to load courses at the moment.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold">FEATURED COURSES</span>
          <h2 className="text-4xl font-bold mt-2 mb-6 text-foreground">
            Learn From Industry Experts
          </h2>
          <p className="text-xl text-muted-foreground">
            Explore our most popular courses designed to help you build practical skills 
            and advance your career.
          </p>
        </div>

        {!courses || courses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No featured courses available yet.</p>
            <p className="text-sm mt-2">Check back soon for exciting new content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link to="/courses">
            <Button 
              size="lg" 
              className="bg-brand hover:bg-brand-dark text-white shadow-lg hover:shadow-xl transition-all group"
            >
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-brand text-brand hover:bg-brand/10 shadow-sm hover:shadow-md transition-all"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
