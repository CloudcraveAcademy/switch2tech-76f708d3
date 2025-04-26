
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
      
      try {
        console.log("Fetching featured courses...");
        
        // First fetch the courses without instructor data to avoid RLS recursion
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(
            `
            *,
            course_categories (
              id,
              name
            )
            `
          )
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError("Failed to load courses.");
          setLoading(false);
          return;
        }

        // Then fetch instructor data separately for each course
        const coursesWithInstructors = await Promise.all(
          coursesData.map(async (course: any) => {
            // Fetch instructor details separately
            let instructor = {
              id: undefined,
              name: "Unknown",
              avatar: "/placeholder.svg",
            };

            if (course.instructor_id) {
              const { data: instructorData, error: instructorError } = await supabase
                .from("user_profiles")
                .select("id, first_name, last_name, avatar_url")
                .eq("id", course.instructor_id)
                .single();

              if (!instructorError && instructorData) {
                instructor = {
                  id: instructorData.id,
                  name: `${instructorData.first_name || ''} ${instructorData.last_name || ''}`.trim(),
                  avatar: instructorData.avatar_url || "/placeholder.svg",
                };
              } else {
                console.warn("Could not fetch instructor:", instructorError);
              }
            }

            return {
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
              instructor: instructor,
              category: course.course_categories?.name || "General",
              image: course.image_url || "/placeholder.svg",
              featured: false,
              tags: [],
              duration:
                course.duration_hours !== undefined && course.duration_hours !== null
                  ? String(course.duration_hours)
                  : "0",
            };
          })
        );

        console.log("Successfully fetched featured courses:", coursesWithInstructors.length);
        setCourses(coursesWithInstructors);
      } catch (error) {
        console.error("Error in fetchCourses:", error);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
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
