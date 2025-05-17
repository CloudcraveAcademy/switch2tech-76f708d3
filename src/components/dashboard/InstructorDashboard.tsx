
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Book, 
  CircleDollarSign, 
  Users,
  Loader2,
  CalendarDays,
  BadgeCheck,
  Bell,
  BarChart,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CourseStats {
  id: string;
  title: string;
  total_students: number;
  revenue: number;
  average_rating: number;
  is_published: boolean;
  completion_rate?: number;
  engagement_score?: number;
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

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
}

// Analytics data mock (would come from API in production)
const generateAnalyticsData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    revenue: Math.floor(Math.random() * 10000) + 1000,
    students: Math.floor(Math.random() * 50) + 5,
  }));
};

// Engagement data mock
const generateEngagementData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    engagement: Math.floor(Math.random() * 100),
    completion: Math.floor(Math.random() * 100),
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const analyticsData = generateAnalyticsData();
  const engagementData = generateEngagementData();

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
          
          // Get completion data
          const { data: completions, error: completionsError } = await supabase
            .from('enrollments')
            .select('completed')
            .eq('course_id', course.id);
            
          const totalEnrollments = completions?.length || 0;
          const completedEnrollments = completions?.filter(e => e.completed).length || 0;
          const completionRate = totalEnrollments > 0 ? 
            Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
          
          // For ratings, placeholder data for now
          const averageRating = 4.5;
          const engagementScore = Math.floor(Math.random() * 100);
          
          return {
            id: course.id,
            title: course.title,
            total_students: studentCount || 0,
            revenue: revenue,
            average_rating: averageRating,
            is_published: course.is_published,
            completion_rate: completionRate,
            engagement_score: engagementScore
          };
        } catch (error) {
          console.error(`Error processing stats for course ${course.id}:`, error);
          return {
            id: course.id,
            title: course.title,
            total_students: 0,
            revenue: 0,
            average_rating: 0,
            is_published: course.is_published,
            completion_rate: 0,
            engagement_score: 0
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
          .limit(5);

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

  // Fetch announcements as notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!courseStats?.length) return;
      
      const courseIds = courseStats.map(course => course.id);
      
      try {
        const { data, error } = await supabase
          .from('course_announcements')
          .select('id, title, content, created_at, course_id')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching announcements:", error);
          return;
        }

        // Transform to notifications format
        const notifs = data.map(ann => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          created_at: ann.created_at,
          read: Math.random() > 0.5 // Mock read status
        }));
        
        setNotifications(notifs);
      } catch (error) {
        console.error("Error processing notifications:", error);
      }
    };
    
    fetchNotifications();
  }, [courseStats]);

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
    courseStats.reduce((acc, curr) => acc + curr.average_rating, 0) / courseStats.length : 0;
  const totalCourses = courseStats?.length || 0;
  const publishedCourses = courseStats?.filter(c => c.is_published).length || 0;
  
  // Metrics for pie chart
  const courseMetrics = [
    { name: 'Published', value: publishedCourses },
    { name: 'Drafts', value: totalCourses - publishedCourses }
  ];

  const courseCompletionData = courseStats?.map(course => ({
    name: course.title.length > 20 ? `${course.title.substring(0, 20)}...` : course.title,
    value: course.completion_rate || 0
  }));

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/10 min-h-screen">
      {/* Header with Greeting & Quick Stats */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome back, {user?.name?.split(" ")[0] || 'Instructor'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your courses today
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/dashboard/create-course">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Active Courses
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {publishedCourses}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {totalCourses} Total
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalStudents}</p>
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                      +{Math.floor(Math.random() * 10) + 1} this week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">₦{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                      +₦{Math.floor(Math.random() * 10000) + 1000} this month
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Average Rating
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{averageRating.toFixed(1)}</p>
                    <div className="flex items-center text-xs text-amber-500 dark:text-amber-400 mt-1">
                      <span>★★★★★</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity & Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Students */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Recent Enrollments</CardTitle>
                <CardDescription>New students in your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!enrollments || enrollments.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No recent enrollments</p>
                  ) : (
                    enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage 
                            src={enrollment.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student_id}`}
                            alt="Student avatar" 
                          />
                          <AvatarFallback>
                            {enrollment.student?.first_name?.[0] || "S"}
                            {enrollment.student?.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {enrollment.student?.first_name} {enrollment.student?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enrolled in <span className="font-medium">{enrollment.courses?.title}</span>
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {enrollments && enrollments.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link to="/dashboard/students">
                      <Button variant="outline" size="sm">View All Students</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Courses */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Your Courses</CardTitle>
                    <CardDescription>Manage and track your courses</CardDescription>
                  </div>
                  <Link to="/dashboard/my-courses">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {courseStats?.length === 0 ? (
                  <div className="text-center py-8">
                    <Book className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="mb-4 text-gray-500">You haven't created any courses yet.</p>
                    <Link to="/dashboard/create-course">
                      <Button>Create Your First Course</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseStats?.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium truncate mr-2">{course.title}</h3>
                            <Badge variant={course.is_published ? "default" : "outline"} className="ml-auto">
                              {course.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {course.total_students} students
                            </span>
                            <span className="flex items-center">
                              <BarChart className="h-3 w-3 mr-1" />
                              {course.completion_rate || 0}% completion
                            </span>
                          </div>
                        </div>
                        <Link to={`/dashboard/courses/${course.id}/edit`} className="ml-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Notifications</CardTitle>
                  <CardDescription>Recent updates and announcements</CardDescription>
                </div>
                <Badge className="ml-2">{notifications.filter(n => !n.read).length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No notifications</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50' : ''}`}>
                      <div className="flex items-start">
                        <div className={`h-8 w-8 rounded-full ${!notification.read ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-gray-100 dark:bg-gray-800/50'} flex items-center justify-center mr-3`}>
                          <Bell className={`h-4 w-4 ${!notification.read ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {notification.content}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="ml-2">
                            <Badge variant="outline" className="h-2 w-2 rounded-full bg-blue-500 p-0" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Track engagement and completion rates across your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Engagement Trends</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="engagement" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="completion" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Course Completion Rates</h3>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        completion: {
                          label: "Completion Rate",
                          color: "#10b981",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={courseCompletionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {courseCompletionData?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent 
                                labelKey="name"
                              />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Course Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Course</th>
                        <th className="text-center py-3 px-4 font-medium">Students</th>
                        <th className="text-center py-3 px-4 font-medium">Completion</th>
                        <th className="text-center py-3 px-4 font-medium">Engagement</th>
                        <th className="text-center py-3 px-4 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStats?.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                                <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium">{course.title}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">{course.total_students}</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{width: `${course.completion_rate || 0}%`}}
                                ></div>
                              </div>
                              <span>{course.completion_rate || 0}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{width: `${course.engagement_score || 0}%`}}
                                ></div>
                              </div>
                              <span>{course.engagement_score || 0}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center">
                              <span className="text-amber-500 mr-1">★</span>
                              <span>{course.average_rating.toFixed(1)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Dashboard Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Dashboard</CardTitle>
              <CardDescription>Track your earnings and financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <CircleDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Monthly Revenue
                        </p>
                        <p className="text-3xl font-bold">₦{(totalRevenue / 12).toFixed(0).toLocaleString()}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Revenue per Student
                        </p>
                        <p className="text-3xl font-bold">
                          ₦{totalStudents > 0 ? (totalRevenue / totalStudents).toFixed(0).toLocaleString() : 0}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        <BadgeCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Course Revenue Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Course</th>
                        <th className="text-center py-3 px-4 font-medium">Students</th>
                        <th className="text-center py-3 px-4 font-medium">Revenue</th>
                        <th className="text-right py-3 px-4 font-medium">Revenue/Student</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStats?.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <span className="font-medium">{course.title}</span>
                          </td>
                          <td className="text-center py-3 px-4">{course.total_students}</td>
                          <td className="text-center py-3 px-4">₦{course.revenue.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">
                            ₦{course.total_students > 0 ? (course.revenue / course.total_students).toFixed(0).toLocaleString() : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Summary</CardTitle>
              <CardDescription>Overview of student engagement and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Student Growth</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Recent Student Activity</h3>
                <div className="space-y-4">
                  {enrollments && enrollments.length > 0 ? (
                    enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage 
                            src={enrollment.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student_id}`}
                            alt="Student avatar" 
                          />
                          <AvatarFallback>
                            {enrollment.student?.first_name?.[0] || "S"}
                            {enrollment.student?.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">
                              {enrollment.student?.first_name} {enrollment.student?.last_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Enrolled in <span className="font-medium">{enrollment.courses?.title}</span>
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span className="flex items-center mr-4">
                              <Users className="h-3 w-3 mr-1" />
                              Progress: {Math.floor(Math.random() * 100)}%
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last active: {Math.floor(Math.random() * 24) + 1}h ago
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">No student activity found</p>
                  )}

                  <div className="text-center mt-4">
                    <Link to="/dashboard/students">
                      <Button>View All Students</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;
