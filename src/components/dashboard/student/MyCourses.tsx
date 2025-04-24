
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  progress: number;
  enrollment_date: string;
  last_accessed: string;
  instructor: {
    first_name: string;
    last_name: string;
  };
}

const MyCourses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ['myCourses'],
    queryFn: async () => {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses (
            id,
            title,
            description,
            image_url,
            level,
            instructor_id,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('student_id', user?.id);

      if (error) {
        console.error('Error fetching my courses:', error);
        return [];
      }

      return enrollments.map(enrollment => ({
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description || '',
        image_url: enrollment.course.image_url,
        level: enrollment.course.level || 'beginner',
        progress: enrollment.progress || 0,
        enrollment_date: enrollment.enrollment_date,
        last_accessed: new Date().toISOString(),
        instructor: {
          first_name: enrollment.course.instructor.first_name || '',
          last_name: enrollment.course.instructor.last_name || '',
        }
      }));
    },
    enabled: !!user,
  });
  
  // Filter courses based on search query
  const filteredCourses = enrolledCourses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Function to determine badge color based on course level
  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800";
      case 'advanced':
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Courses</h1>
          <p className="text-gray-600">Manage your enrolled courses</p>
        </div>
        
        <div className="relative mt-4 md:mt-0 w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {filteredCourses?.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">You haven't enrolled in any courses yet</h3>
              <p className="text-gray-500 mt-2 mb-6">Browse our courses catalog to find something you're interested in</p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses?.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses?.filter(course => course.progress > 0 && course.progress < 100)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            
            {filteredCourses?.filter(course => course.progress > 0 && course.progress < 100).length === 0 && (
              <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">No courses in progress</h3>
                <p className="text-gray-500 mt-2">Start learning to see courses here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses?.filter(course => course.progress === 100)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            
            {filteredCourses?.filter(course => course.progress === 100).length === 0 && (
              <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">No completed courses yet</h3>
                <p className="text-gray-500 mt-2">Keep learning to complete your first course</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CourseCardProps {
  course: EnrolledCourse;
}

const CourseCard = ({ course }: CourseCardProps) => {
  // Helper function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800";
      case 'advanced':
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="h-40 relative">
        <img 
          src={course.image_url || '/placeholder.svg'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getLevelBadgeColor(course.level)}>
            {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="font-bold truncate">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {course.instructor.first_name} {course.instructor.last_name}
        </p>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-semibold">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>Enrolled: {formatDate(course.enrollment_date)}</span>
          <span>Last accessed: {formatDate(course.last_accessed)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/courses/${course.id}`}>
            {course.progress === 100 ? "Review Course" : "Continue Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyCourses;
