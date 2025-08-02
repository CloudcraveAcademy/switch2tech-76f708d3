
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Courses = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const COURSES_PER_PAGE = 20;
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses from database...");
        setError(null);
        
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(`
            *,
            instructor:user_profiles!courses_instructor_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            ),
            course_category:course_categories!courses_category_fkey(
              id,
              name
            ),
            enrollments(count),
            lessons(count)
          `)
          .eq("is_published", true);

        if (!isMounted) return;

        console.log("Courses query completed:", { coursesData, coursesError });

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError(`Failed to fetch courses: ${coursesError.message}`);
          return;
        }

        if (!coursesData || coursesData.length === 0) {
          console.log("No courses found");
          setCourses([]);
          return;
        }

        console.log("Processing", coursesData.length, "courses");

        const transformedCourses: Course[] = coursesData.map((course: any) => {
          const instructorName = course.instructor 
            ? `${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`.trim() || 'Unknown Instructor'
            : 'Unknown Instructor';

          return {
            id: course.id,
            title: course.title || "Untitled Course",
            description: course.description || "No description available",
            price: Number(course.price) || 0,
            discounted_price: course.discounted_price ? Number(course.discounted_price) : undefined,
            level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
            rating: 0, // Will be fetched dynamically in CourseCard
            reviews: 0, // Will be fetched dynamically in CourseCard
            mode: (course.mode === "virtual-live") ? "virtual-live" : "self-paced",
            enrolledStudents: course.enrollments?.[0]?.count || 0,
            lessons: course.lessons?.[0]?.count || 0,
            instructor: {
              id: course.instructor?.id,
              name: instructorName,
              avatar: course.instructor?.avatar_url || "/placeholder.svg"
            },
            category: course.course_category?.name || "General",
            image: course.image_url || "/placeholder.svg",
            featured: course.id.includes("featured"),
            tags: [],
            duration: course.duration_hours ? `${course.duration_hours} hours` : "10 hours",
          };
        });

        // Sort courses by enrollment count (popularity) - highest first
        const sortedCourses = transformedCourses.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
        
        console.log("Successfully processed courses:", sortedCourses.length);
        setCourses(sortedCourses);

      } catch (error) {
        console.error("Exception while fetching courses:", error);
        if (isMounted) {
          setError(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setCourses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    const matchesMode = selectedMode === "all" || 
                       (selectedMode === "virtual-live" && course.mode === "virtual-live") ||
                       (selectedMode === "self-paced" && course.mode === "self-paced");
    
    return matchesSearch && matchesCategory && matchesLevel && matchesMode;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel, selectedMode]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    
    return pages;
  };

  if (loading || categoriesLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-6 py-12">
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-6 py-12">
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-red-500">Error loading courses: {error}</p>
                <Button onClick={() => {
                  setLoading(true);
                  setError(null);
                  window.location.reload();
                }}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">All Courses</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive collection of courses designed to help you master new skills and advance your career.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="self-paced">Self-paced</SelectItem>
                    <SelectItem value="virtual-live">Virtual Live Classes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
              {filteredCourses.length !== courses.length && ` (filtered from ${courses.length})`}
            </p>
            {searchTerm && (
              <Badge variant="secondary" className="px-3 py-1">
                Search: "{searchTerm}"
              </Badge>
            )}
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                  setSelectedMode("all");
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum, index) => {
                      const pages = getPageNumbers();
                      const isFirst = index === 0;
                      const isLast = index === pages.length - 1;
                      const shouldShowEllipsis = (isFirst && pageNum > 1) || (isLast && pageNum < totalPages);
                      
                      return (
                        <div key={pageNum} className="flex items-center">
                          {isFirst && pageNum > 1 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(1);
                                  }}
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {pageNum > 2 && <PaginationEllipsis />}
                            </>
                          )}
                          
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                          
                          {isLast && pageNum < totalPages && (
                            <>
                              {pageNum < totalPages - 1 && <PaginationEllipsis />}
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(totalPages);
                                  }}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Courses;
