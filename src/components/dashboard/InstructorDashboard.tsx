
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

interface EnrollmentWithStudent {
  id: string;
  enrollment_date: string;
  student_id: string;
  course_id: string;
  courses?: {
    title: string;
  };
  student?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

const InstructorDashboard = () => {
  const { user } = useAuth();

  // Query courses with aggregated data
  const { data: courseStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['instructorCourses', user?.id],
    queryFn: async () => {
      console.log("Fetching instructor courses for:", user?.id);
      // Get basic course data first
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .eq('instructor_id', user?.id);

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        throw coursesError;
      }
      
      console.log(`Found ${courses?.length || 0} courses for instructor`);
      
      if (!courses?.length) return [];
      
      // For each course, get enrollment count
      const coursesWithStats = await Promise.all(courses.map(async (course) => {
        try {
          // Count enrollments
          const { count: studentCount, error: countError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);
            
          if (countError) {
            console.error("Error counting enrollments:", countError);
            throw countError;
          }
          
          // Calculate revenue (from payment_transactions)
          const { data: payments, error: paymentsError } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('course_id', course.id)
            .eq('status', 'success');
            
          const revenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
          
          // For ratings, placeholder data for now
          const averageRating = 4.5;
          
          return {
            id: course.id,
            title: course.title,
            total_students: studentCount || 0,
            revenue: revenue,
            average_rating: averageRating,
            is_published: course.is_published
          };
        } catch (error) {
          console.error(`Error processing stats for course ${course.id}:`, error);
          return {
            id: course.id,
            title: course.title,
            total_students: 0,
            revenue: 0,
            average_rating: 0,
            is_published: course.is_published
          };
        }
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
      console.log("Fetching enrollments for courses:", courseIds);
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            id, 
            enrollment_date,
            student_id,
            course_id,
            courses:course_id(title)
          `)
          .in('course_id', courseIds)
          .order('enrollment_date', { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching enrollments:", error);
          throw error;
        }

        // Get student profile data for each enrollment
        const enrollmentsWithStudents = await Promise.all((data || []).map(async (enrollment) => {
          try {
            const { data: studentProfile, error: studentError } = await supabase
              .from('user_profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', enrollment.student_id)
              .maybeSingle();

            if (studentError) {
              console.error("Error fetching student profile:", studentError);
              throw studentError;
            }

            return {
              ...enrollment,
              student: studentProfile || { 
                first_name: "Unknown", 
                last_name: "Student", 
                avatar_url: null 
              }
            };
          } catch (error) {
            console.error("Error processing student data:", error);
            // Return the enrollment with a default student object to prevent type errors
            return {
              ...enrollment,
              student: { 
                first_name: "Unknown", 
                last_name: "Student", 
                avatar_url: null 
              }
            };
          }
        }));

        return enrollmentsWithStudents as EnrollmentWithStudent[];
      } catch (error) {
        console.error("Error in enrollments query:", error);
        return [];
      }
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
          Welcome, {user?.name?.split(" ")[0] || 'Instructor'}!
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
                  {courseStats?.filter(course => course.is_published).length || 0}
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
          {courseStats?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="mb-4">You haven't created any courses yet.</p>
                <Link to="/dashboard/create-course">
                  <Button>Create Your First Course</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            courseStats?.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center">
                    <span>{course.title}</span>
                    <Link to={`/dashboard/courses/${course.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-brand-600">
                        Edit
                      </Button>
                    </Link>
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
                      <span className={`font-medium ${course.is_published ? 'text-green-600' : 'text-amber-600'}`}>
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium">₦{course.revenue.toLocaleString()}</span>
                    </div>
                    <Link to={`/dashboard/courses/${course.id}/edit`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <h2 className="text-xl font-bold mb-4">Recent Student Activities</h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {!enrollments || enrollments.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No recent enrollments</p>
            ) : (
              enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={enrollment.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student_id}`}
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
                      Enrolled in "{enrollment.courses?.title}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
