
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

        // Use timeout to prevent hanging queries
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        );

        const queryPromise = supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        const { data: coursesData, error: coursesError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw coursesError;
        }

        console.log("Raw courses data:", coursesData);

        if (!coursesData) {
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
        console.error("Error message:", error.message);
        console.error("Error details:", error);
        
        // Set fallback data on error
        const fallbackCourses: Course[] = [
          {
            id: "fallback-1",
            title: "Introduction to Web Development",
            description: "Learn the basics of web development with HTML, CSS, and JavaScript",
            price: 99,
            level: "beginner",
            rating: 4.5,
            reviews: 120,
            mode: "self-paced",
            enrolledStudents: 150,
            lessons: 12,
            instructor: {
              name: "Expert Instructor",
              avatar: "/placeholder.svg"
            },
            category: "Technology",
            image: "/placeholder.svg",
            featured: true,
            tags: [],
            duration: "10 hours",
          },
          {
            id: "fallback-2",
            title: "Advanced React Development",
            description: "Master React with hooks, state management, and modern patterns",
            price: 149,
            level: "advanced",
            rating: 4.8,
            reviews: 85,
            mode: "virtual",
            enrolledStudents: 95,
            lessons: 18,
            instructor: {
              name: "React Expert",
              avatar: "/placeholder.svg"
            },
            category: "Technology",
            image: "/placeholder.svg",
            featured: true,
            tags: [],
            duration: "15 hours",
          }
        ];
        
        console.log("Setting fallback courses due to error");
        setCourses(fallbackCourses);
        setError("Unable to load courses from database. Showing sample courses.");
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

        {error && (
          <div className="text-center mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {courses.length === 0 && !loading && !error ? (
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
