
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
        console.log("Starting to fetch featured courses...");
        setLoading(true);
        setError(null);

        // Simplified query without timeout
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
          console.log("No courses data received");
          setCourses([]);
          return;
        }

        console.log("Number of courses fetched:", coursesData.length);

        // Transform courses with fallback data
        const transformedCourses: Course[] = coursesData.map((course: any) => {
          console.log("Transforming course:", course.id, course.title);
          return {
            id: course.id,
            title: course.title || "Untitled Course",
            description: course.description || "No description available",
            price: Number(course.price) || 0,
            discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
            level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
            rating: 4.5,
            reviews: 120,
            mode: (course.mode as "self-paced" | "virtual" | "live") || "self-paced",
            enrolledStudents: 150,
            lessons: 12,
            instructor: {
              name: "Expert Instructor",
              avatar: "/placeholder.svg"
            },
            category: "Technology",
            image: course.image_url || "/placeholder.svg",
            featured: true,
            tags: [],
            duration: course.duration_hours ? `${course.duration_hours} hours` : "10 hours",
          };
        });

        console.log("Successfully transformed courses:", transformedCourses.length);
        setCourses(transformedCourses);
        
      } catch (error: any) {
        console.error("Error in fetchCourses:", error);
        setError("Unable to load courses from database. Please try refreshing the page.");
        
        // Use empty array instead of fallback data to show the error state
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  console.log("Render state - loading:", loading, "courses:", courses.length, "error:", error);

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
            <div className="flex flex-col items-center space-y-4">
              <Loader className="animate-spin h-10 w-10 text-primary" />
              <p className="text-muted-foreground">Loading featured courses...</p>
            </div>
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

        {error ? (
          <div className="text-center mb-8 p-8 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Courses</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Refresh Page
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <h3 className="text-xl font-semibold mb-2">No Featured Courses Available</h3>
            <p>Check back soon for new courses!</p>
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
