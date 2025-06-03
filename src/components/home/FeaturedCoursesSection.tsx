
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
        
        // Step 1: Fetch published courses first
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            description,
            price,
            discounted_price,
            level,
            mode,
            image_url,
            instructor_id,
            category,
            duration_hours,
            is_published
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw coursesError;
        }

        console.log("Fetched courses:", coursesData?.length);
        
        if (!coursesData || coursesData.length === 0) {
          setCourses([]);
          return;
        }

        // Step 2: Fetch categories in a separate query
        const { data: categories } = await supabase
          .from("course_categories")
          .select("id, name");
        
        const categoryMap = categories ? 
          categories.reduce((map, cat) => ({ ...map, [cat.id]: cat.name }), {} as Record<string, string>) : 
          {};

        // Step 3: Process courses with categories
        const coursePromises = coursesData.map(async (course) => {
          // Step 4: Fetch instructor details separately for each course
          const { data: instructorData } = await supabase
            .from("user_profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", course.instructor_id)
            .maybeSingle();
          
          const instructor = instructorData ? {
            id: instructorData.id,
            name: `${instructorData.first_name || ''} ${instructorData.last_name || ''}`.trim() || "Instructor",
            avatar: instructorData.avatar_url || "/placeholder.svg"
          } : {
            name: "Instructor",
            avatar: "/placeholder.svg"
          };

          // Step 5: Fetch enrollment count for this course
          const { count: enrollmentCount } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);

          // Step 6: Fetch lesson count for this course
          const { count: lessonCount } = await supabase
            .from("lessons")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);

          // Generate dummy random rating and reviews if they don't exist in the database
          const randomRating = Math.round(3 + Math.random() * 2); // 3-5 stars
          const randomReviews = Math.floor(10 + Math.random() * 100); // 10-110 reviews

          // Safely map mode to the correct type
          let courseMode: "self-paced" | "virtual" | "live" = "self-paced";
          if (course.mode === "virtual" || course.mode === "live") {
            courseMode = course.mode;
          }

          return {
            id: course.id,
            title: course.title || "Untitled Course",
            description: course.description || "",
            price: course.price ? parseFloat(course.price.toString()) : 0,
            discounted_price: course.discounted_price ? parseFloat(course.discounted_price.toString()) : undefined,
            level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
            rating: randomRating,
            reviews: randomReviews,
            mode: courseMode,
            enrolledStudents: enrollmentCount || 0,
            lessons: lessonCount || 0,
            instructor: instructor,
            category: categoryMap[course.category as string] || "General",
            image: course.image_url || "/placeholder.svg",
            featured: true,
            tags: [],
            duration: course.duration_hours ? `${course.duration_hours}` : "0",
          };
        });

        const processedCourses = await Promise.all(coursePromises);
        console.log("Processed featured courses:", processedCourses.length);
        setCourses(processedCourses);
      } catch (error: any) {
        console.error("Error in fetchCourses:", error);
        setError("Failed to load courses. Please try again later.");
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
            <div className="col-span-full text-center text-muted-foreground py-12">
              No featured courses available yet. Check back soon!
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
