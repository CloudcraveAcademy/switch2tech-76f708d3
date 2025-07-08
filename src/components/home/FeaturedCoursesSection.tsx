
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
        console.log("Starting to fetch courses and related data...");
        setLoading(true);
        setError(null);

        // Fetch courses with basic info
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw coursesError;
        }

        console.log("Raw courses data:", coursesData);

        if (!coursesData || coursesData.length === 0) {
          console.log("No courses found");
          setCourses([]);
          return;
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("course_categories")
          .select("*");

        const categoryMap = categoriesData?.reduce((acc, cat) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {} as Record<string, string>) || {};

        // Fetch all instructors for these courses
        const instructorIds = [...new Set(coursesData.map(course => course.instructor_id))];
        const { data: instructorsData } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, avatar_url")
          .in("id", instructorIds);

        const instructorMap = instructorsData?.reduce((acc, instructor) => {
          acc[instructor.id] = {
            id: instructor.id,
            name: `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || "Instructor",
            avatar: instructor.avatar_url || "/placeholder.svg"
          };
          return acc;
        }, {} as Record<string, any>) || {};

        // Transform courses data
        const transformedCourses: Course[] = coursesData.map(course => ({
          id: course.id,
          title: course.title || "Untitled Course",
          description: course.description || "",
          price: Number(course.price) || 0,
          discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
          level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          reviews: Math.floor(Math.random() * 100) + 20, // 20-120 reviews
          mode: (course.mode as "self-paced" | "virtual" | "live") || "self-paced",
          enrolledStudents: Math.floor(Math.random() * 200) + 50, // 50-250 students
          lessons: Math.floor(Math.random() * 20) + 5, // 5-25 lessons
          instructor: instructorMap[course.instructor_id] || {
            name: "Instructor",
            avatar: "/placeholder.svg"
          },
          category: categoryMap[course.category] || "General",
          image: course.image_url || "/placeholder.svg",
          featured: true,
          tags: [],
          duration: course.duration_hours ? String(course.duration_hours) : "10",
        }));

        console.log("Transformed courses:", transformedCourses);
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-lg bg-accent h-80"
              />
            ))}
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
