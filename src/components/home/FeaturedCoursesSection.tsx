
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { ArrowRight, Loader2 } from "lucide-react";
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
  mode: "self-paced" | "virtual-live"; 
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
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        console.log("=== FETCHING PUBLISHED COURSES ===");

        // Fetch all published courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select(`
            *,
            instructor:user_profiles_public!courses_instructor_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError("Unable to load courses");
          setLoading(false);
          return;
        }

        if (!isMounted) return;

        console.log(`Found ${coursesData?.length || 0} published courses`);

        // Get enrollment counts for each course
        const coursesWithEnrollmentCounts = await Promise.all(
          (coursesData || []).map(async (course: any) => {
            const { count: enrollmentCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
            
            return {
              ...course,
              enrollment_count: enrollmentCount || 0
            };
          })
        );

        console.log("=== COURSES WITH ENROLLMENT COUNTS ===");
        coursesWithEnrollmentCounts.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title}: ${course.enrollment_count} enrollments`);
        });

        // Transform the courses for display
        const transformedCourses: Course[] = coursesWithEnrollmentCounts.map((course: any) => ({
          id: course.id,
          title: course.title || "Untitled Course",
          description: course.description || "No description available",
          price: Number(course.price) || 0,
          discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
          level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
          rating: 4.5,
          reviews: 120,
          mode: (course.mode === "virtual-live") ? "virtual-live" : "self-paced",
          enrolledStudents: course.enrollment_count,
          lessons: 12,
          instructor: {
            id: course.instructor?.id,
            name: course.instructor ? `${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`.trim() || "Expert Instructor" : "Expert Instructor",
            avatar: course.instructor?.avatar_url || "/placeholder.svg"
          },
          category: "Technology",
          image: course.image_url || "/placeholder.svg",
          featured: true,
          tags: [],
          duration: course.duration_hours ? `${course.duration_hours} hours` : "10 hours",
        }));

        console.log("=== TRANSFORMED COURSES WITH ENROLLMENT COUNTS ===");
        transformedCourses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title}: ${course.enrolledStudents} students (enrolledStudents property)`);
        });

        console.log("Successfully processed top enrolled courses");
        setCourses(transformedCourses);
        setLoading(false);
        
      } catch (error: any) {
        console.error("Course fetch error:", error);
        if (isMounted) {
          setError("Failed to load courses");
          setCourses([]);
          setLoading(false);
        }
      }
    };

    fetchCourses();
    
    return () => {
      isMounted = false;
    };
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
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
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
