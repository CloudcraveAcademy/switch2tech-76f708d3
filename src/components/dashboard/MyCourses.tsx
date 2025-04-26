
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  Loader2,
  Eye,
  Users,
  Clock,
  Edit,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  price?: number;
  is_published: boolean;
  level?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  students_count?: number;
}

const MyCourses = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch instructor courses with student counts
  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First, get all courses by the instructor
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;
      if (!coursesData) return [];

      // Then, for each course, count the enrolled students
      const coursesWithCounts = await Promise.all(
        coursesData.map(async (course) => {
          const { count, error } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);

          if (error) {
            console.error("Error fetching enrollment count:", error);
            return { ...course, students_count: 0 };
          }

          return { ...course, students_count: count || 0 };
        })
      );

      return coursesWithCounts as Course[];
    },
    enabled: !!user?.id,
  });

  // Filter courses based on active tab
  const filteredCourses = courses?.filter((course) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return course.is_published;
    if (activeTab === "drafts") return !course.is_published;
    return true;
  });

  // Function to handle publishing a course
  const handlePublishCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_published: true })
        .eq("id", courseId);

      if (error) throw error;
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-2" /> My Courses
          </h1>
          <p className="text-gray-600">Manage your courses and their content</p>
        </div>
        <Link to="/dashboard/create-course">
          <Button className="flex items-center">
            <Plus className="mr-1 h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start h-auto p-0">
              <TabsTrigger 
                value="all" 
                className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
              >
                All Courses ({courses?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="published" 
                className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
              >
                Published ({courses?.filter(c => c.is_published).length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="drafts" 
                className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
              >
                Drafts ({courses?.filter(c => !c.is_published).length || 0})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-6">
            <CourseGrid courses={filteredCourses || []} onPublish={handlePublishCourse} />
          </TabsContent>
          
          <TabsContent value="published" className="mt-6">
            <CourseGrid courses={filteredCourses || []} onPublish={handlePublishCourse} />
          </TabsContent>
          
          <TabsContent value="drafts" className="mt-6">
            <CourseGrid courses={filteredCourses || []} onPublish={handlePublishCourse} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// CourseGrid component for displaying courses
const CourseGrid = ({ 
  courses, 
  onPublish 
}: { 
  courses: Course[],
  onPublish: (courseId: string) => Promise<void>
}) => {
  if (courses.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No courses found</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new course</p>
        <Link to="/dashboard/create-course">
          <Button className="mt-4">
            <Plus className="mr-1 h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <div className="relative h-40 bg-gray-100">
            {course.image_url ? (
              <img 
                src={course.image_url} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={course.is_published ? "default" : "outline"}>
                {course.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {course.category || "Uncategorized"} • {course.level || "All Levels"}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-1 -mr-2">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">Course menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to={`/dashboard/courses/${course.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Course
                    </DropdownMenuItem>
                  </Link>
                  {!course.is_published && (
                    <DropdownMenuItem onClick={() => onPublish(course.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Publish
                    </DropdownMenuItem>
                  )}
                  <Link to={`/dashboard/courses/${course.id}/students`}>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" /> View Students
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
            
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course.students_count} students
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(course.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" asChild>
              <Link to={`/dashboard/courses/${course.id}`}>
                <Eye className="mr-1 h-4 w-4" /> Preview
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/dashboard/courses/${course.id}/edit`}>
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MyCourses;
