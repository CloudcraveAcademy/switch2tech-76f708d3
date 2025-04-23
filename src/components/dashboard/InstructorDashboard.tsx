
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Book, 
  CircleDollarSign, 
  Users,
  Loader2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CourseStats {
  id: string;
  title: string;
  total_students: number;
  revenue: number;
  average_rating: number;
  is_published: boolean;
}

interface RecentActivity {
  id: string;
  student_name: string;
  action: string;
  course_name: string;
  timestamp: string;
  avatar_url?: string;
}

const InstructorDashboard = () => {
  const { user } = useAuth();

  // Query courses with aggregated data instead of using the view directly
  const { data: courseStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['instructorCourses', user?.id],
    queryFn: async () => {
      // Get basic course data first
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .eq('instructor_id', user?.id);

      if (coursesError) throw coursesError;
      
      // For each course, get enrollment count
      const coursesWithStats = await Promise.all(courses.map(async (course) => {
        // Count enrollments
        const { count: studentCount, error: countError } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);
          
        if (countError) throw countError;
        
        // Calculate revenue (could be from payment_transactions or other source)
        // For now using a placeholder calculation
        const revenue = (studentCount || 0) * 50; // Assuming $50 per enrollment
        
        // For ratings, this would typically come from a ratings table
        // Using placeholder data for now
        const averageRating = 4.5;
        
        return {
          id: course.id,
          title: course.title,
          total_students: studentCount || 0,
          revenue: revenue,
          average_rating: averageRating,
          is_published: course.is_published
        };
      }));

      return coursesWithStats as CourseStats[];
    },
    enabled: !!user?.id
  });

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['recentEnrollments', user?.id],
    queryFn: async () => {
      if (!courseStats?.length) return [];
      
      const courseIds = courseStats.map(course => course.id);
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          enrollment_date,
          student_id,
          course_id,
          student:user_profiles(first_name, last_name),
          course:courses(title)
        `)
        .in('course_id', courseIds)
        .order('enrollment_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!courseStats?.length
  });

  if (isLoadingStats || isLoadingEnrollments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalStudents = courseStats?.reduce((acc, curr) => acc + curr.total_students, 0) || 0;
  const totalRevenue = courseStats?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  const averageRating = courseStats?.length ? 
    courseStats.reduce((acc, curr) => acc + curr.average_rating, 0) / courseStats.length : 
    0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          Manage your courses and students
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Courses
                </p>
                <p className="text-3xl font-bold">
                  {courseStats?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Rating
                </p>
                <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Courses */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Courses</h2>
          <Link to="/dashboard/create-course">
            <Button>Create New Course</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courseStats?.map((course) => (
            <Card key={course.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span>{course.title}</span>
                  <Button variant="ghost" size="sm" className="text-brand-600">
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Students</span>
                    <span className="font-medium">{course.total_students}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <Link to={`/dashboard/course/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <h2 className="text-xl font-bold mb-4">Recent Student Activities</h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {enrollments?.map((enrollment) => (
              <div key={enrollment.id} className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student_id}`}
                    alt="Student" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">
                      {enrollment.student?.first_name} {enrollment.student?.last_name}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Enrolled in "{enrollment.course?.title}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
