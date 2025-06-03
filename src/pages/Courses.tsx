
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, LoaderCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseCategory {
  id: string;
  name: string;
}

interface SupabaseInstructor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface SupabaseCourse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  discounted_price?: number | null;
  discount_enabled?: boolean;
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
}

const PAGE_SIZE = 9;

const fetchCoursesWithExtra = async (): Promise<SupabaseCourse[]> => {
  try {
    console.log("Fetching courses from database...");
    
    const { data, error } = await supabase
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
      .eq("is_published", true);

    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }

    const coursesWithInstructors = await Promise.all(
      data.map(async (course) => {
        if (course.instructor_id) {
          const { data: instructor, error: instructorError } = await supabase
            .from("user_profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", course.instructor_id)
            .single();

          if (instructorError) {
            console.warn("Could not fetch instructor:", instructorError);
            return {
              ...course,
              instructor: null
            };
          }

          return {
            ...course,
            instructor
          };
        }
        return course;
      })
    );

    return (
      coursesWithInstructors?.map((course: any) => ({
        ...course,
        rating: course.rating || Math.round(4 + Math.random()),
        reviews: course.reviews || Math.floor(20 + Math.random() * 500),
        enrolledStudents: course.enrolledStudents || Math.floor(Math.random() * 200),
        lessons: course.lessons || Math.floor(Math.random() * 25 + 5),
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

const fetchCategories = async (): Promise<SupabaseCategory[]> => {
  const { data, error } = await supabase.from("course_categories").select("*");
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  return data || [];
};

const Courses = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("category");

  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [allCourses, setAllCourses] = useState<SupabaseCourse[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL || "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const pagedCourses = courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchCategories(), fetchCoursesWithExtra()])
      .then(([cats, courses]) => {
        console.log("Successfully fetched categories and courses:", { 
          categoriesCount: cats.length, 
          coursesCount: courses.length 
        });
        setCategories(cats);
        setAllCourses(courses);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load courses or categories:", e);
        setError("Failed to load courses. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filteredCourses = [...allCourses];

    if (searchTerm) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          (course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    if (selectedCategory !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.category === selectedCategory
      );
    }

    if (selectedLevel !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.level === selectedLevel
      );
    }

    if (selectedMode !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.mode === selectedMode
      );
    }

    setCourses(filteredCourses);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel, selectedMode, allCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleGotoPage = (n: number) => setCurrentPage(n);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find the perfect course to advance your tech skills and transform your career.
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Mode</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="virtual">Virtual Live Class</SelectItem>
                    <SelectItem value="self-paced">Self-paced Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading courses..."
                  : (
                    <>Showing <span className="font-medium">{courses.length}</span> results</>
                  )}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                  setSelectedMode("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="animate-spin h-10 w-10 text-brand-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const [cats, courses] = await Promise.all([fetchCategories(), fetchCoursesWithExtra()]);
                  setCategories(cats);
                  setAllCourses(courses);
                } catch (e) {
                  setError("Failed to load. Try again.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Retry
            </Button>
          </div>
        ) : pagedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pagedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  ...course,
                  instructor: course.instructor
                    ? {
                        ...course.instructor,
                        name: course.instructor.first_name + " " + course.instructor.last_name,
                        avatar: course.instructor.avatar_url || "/placeholder.svg",
                      }
                    : {
                        name: "Unknown",
                        avatar: "/placeholder.svg",
                      },
                  category: categories.find((cat) => cat.id === course.category)?.name || "General",
                  rating: course.rating,
                  reviews: course.reviews,
                  enrolledStudents: course.enrolledStudents,
                  lessons: course.lessons,
                  image: course.image_url || "/placeholder.svg",
                  mode: course.mode || "self-paced",
                  price: typeof course.price === "number" ? course.price : 0,
                  discounted_price: typeof course.discounted_price === "number" ? course.discounted_price : undefined,
                  discount_enabled: course.discount_enabled || false,
                  level: course.level || "beginner",
                  featured: false,
                  tags: [],
                  duration: (course.duration_hours !== undefined && course.duration_hours !== null)
                    ? String(course.duration_hours)
                    : "0",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedLevel("all");
                setSelectedMode("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={handlePrevPage}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPage === idx + 1 ? "default" : "outline"}
                  className={currentPage === idx + 1 ? "bg-brand-100 text-brand-600" : ""}
                  onClick={() => handleGotoPage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
