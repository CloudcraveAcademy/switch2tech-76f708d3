
import { useEffect, useState } from "react";
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

const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching featured courses...");
        setLoading(true);
        setError(null);

        // Simple query to get courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw new Error("Failed to fetch courses");
        }

        console.log("Raw courses data:", coursesData);

        if (!coursesData || coursesData.length === 0) {
          console.log("No courses found");
          setCourses([]);
          return;
        }

        // Transform courses data with simple fallbacks
        const transformedCourses: Course[] = coursesData.map(course => ({
          id: course.id,
          title: course.title || "Untitled Course",
          description: course.description || "",
          price: Number(course.price) || 0,
          discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
          level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
          rating: 4.5, // Static rating for now
          reviews: 42, // Static reviews for now
          mode: (course.mode as "self-paced" | "virtual" | "live") || "self-paced",
          enrolledStudents: 156, // Static number for now
          lessons: 8, // Static number for now
          instructor: {
            id: course.instructor_id,
            name: "Instructor", // Static name for now
            avatar: "/placeholder.svg"
          },
          category: "Technology", // Static category for now
          image: course.image_url || "/placeholder.svg",
          featured: true,
          tags: [],
          duration: course.duration_hours ? String(course.duration_hours) : "10",
        }));

        console.log("Courses transformed successfully:", transformedCourses.length);
        setCourses(transformedCourses);
      } catch (error: any) {
        console.error("Error in fetchCourses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
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
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <Loader className="mr-2 h-4 w-4" />
              Retry
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

        {courses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No featured courses available yet. Check back soon!
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
