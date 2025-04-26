import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { ArrowRight, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Course as MockCourse } from "@/utils/mockData";

type Course = Omit<MockCourse, 'level'> & {
  id: string;
  title: string;
  description: string | null;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  rating: number;
  reviews: number;
  mode: string;
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

interface SupabaseInstructor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface SupabaseCategory {
  id: string;
  name: string;
}

interface SupabaseCourse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  rating?: number;
  reviews?: number;
  mode: "self-paced" | "virtual" | "live" | null;
  enrolledStudents?: number;
  lessons?: number;
  image_url: string | null;
  category: string | null;
  instructor_id: string;
  instructor?: SupabaseInstructor;
  course_categories?: SupabaseCategory;
  duration_hours?: number;
  user_profiles?: SupabaseInstructor;
}

const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          *,
          course_categories (
            id,
            name
          ),
          user_profiles:instructor_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
          `
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        setError("Failed to load courses.");
        setLoading(false);
        return;
      }

      const formatted: Course[] = (data || []).map((course: any) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: typeof course.price === "number" ? course.price : 0,
        level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
        rating: course.rating || Math.round(4 + Math.random()),
        reviews: course.reviews || Math.floor(20 + Math.random() * 500),
        mode: course.mode || "self-paced",
        enrolledStudents: course.enrolledStudents || Math.floor(Math.random() * 200),
        lessons: course.lessons || Math.floor(Math.random() * 25 + 5),
        instructor: course.user_profiles
          ? {
              id: course.user_profiles.id,
              name: course.user_profiles.first_name + " " + course.user_profiles.last_name,
              avatar: course.user_profiles.avatar_url || "/placeholder.svg",
            }
          : {
              name: "Unknown",
              avatar: "/placeholder.svg",
            },
        category: course.course_categories?.name || "General",
        image: course.image_url || "/placeholder.svg",
        featured: false,
        tags: [],
        duration:
          course.duration_hours !== undefined && course.duration_hours !== null
            ? String(course.duration_hours)
            : "0",
      }));
      setCourses(formatted);
      setLoading(false);
    };

    fetchCourses();
  }, []);

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

        <div className="min-h-[320px] grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-lg bg-accent h-80"
              />
            ))
          ) : error ? (
            <div className="col-span-full text-center text-destructive">
              <p className="mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Retry
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No featured courses available.
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>

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
