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

interface Category {
  id: string;
  name: string;
}

interface Course {
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
}

const PAGE_SIZE = 9;

const Courses = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("category");

  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching courses and categories...");

        // Fetch categories first (simple query)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("course_categories")
          .select("id, name")
          .order("name");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
        }

        setCategories(categoriesData || []);

        // Simple courses fetch
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw new Error("Failed to fetch courses");
        }

        console.log("Fetched courses:", coursesData?.length);

        if (!coursesData || coursesData.length === 0) {
          setAllCourses([]);
          setCourses([]);
          return;
        }

        // Simple transformation without complex joins
        const transformedCourses: Course[] = coursesData.map(course => ({
          id: course.id,
          title: course.title || "Untitled Course",
          description: course.description || "",
          price: Number(course.price) || 0,
          discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
          level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
          rating: 4.5, // Static for now
          reviews: 85, // Static for now
          mode: (course.mode as "self-paced" | "virtual" | "live") || "self-paced",
          enrolledStudents: 120, // Static for now
          lessons: 15, // Static for now
          instructor: {
            name: "Instructor",
            avatar: "/placeholder.svg"
          },
          category: "Technology", // Static for now - will be enhanced later
          image: course.image_url || "/placeholder.svg",
          featured: false,
          tags: [],
          duration: course.duration_hours ? String(course.duration_hours) : "10",
        }));

        console.log("Transformed courses:", transformedCourses.length);
        setAllCourses(transformedCourses);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleGotoPage = (n: number) => setCurrentPage(n);

  useEffect(() => {
    let filteredCourses = [...allCourses];

    if (searchTerm) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    if (selectedCategory !== "all") {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
      if (categoryName) {
        filteredCourses = filteredCourses.filter(
          (course) => course.category === categoryName
        );
      }
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
  }, [searchTerm, selectedCategory, selectedLevel, selectedMode, allCourses, categories]);

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
                  : `Showing ${courses.length} results`}
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
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : pagedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pagedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
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
