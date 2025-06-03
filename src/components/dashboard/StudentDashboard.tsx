import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Book, Calendar, Clock, Star, Bell, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import { useProfileData } from "@/hooks/useProfileData";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: {
    name: string;
  };
  progress: number;
  level: string;
  mode: string;
  price?: number;
  completed: boolean;
  nextLesson: {
    title: string;
    duration: string;
    date: string;
  };
  image: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { profileData } = useProfileData();

  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: async () => {
      try {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses (
              id,
              title,
              image_url,
              level,
              mode,
              price,
              instructor:user_profiles!instructor_id (
                first_name,
                last_name
              )
            )
          `)
          .eq('student_id', user?.id);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          throw enrollmentsError;
        }

        // Get next lesson for each course
        const coursesWithNextLesson = await Promise.all(enrollments.map(async (enrollment) => {
          // Fetch lessons for the course
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', enrollment.course.id)
            .order('order_number', { ascending: true })
            .limit(1);

          if (lessonsError) {
            console.error('Error fetching lessons:', lessonsError);
          }

          const nextLesson = lessons && lessons.length > 0 ? lessons[0] : null;

          return {
            id: enrollment.course.id,
            title: enrollment.course.title,
            instructor: {
              name: `${enrollment.course.instructor.first_name || ''} ${enrollment.course.instructor.last_name || ''}`.trim(),
            },
            progress: enrollment.progress || 0,
            level: enrollment.course.level || 'beginner',
            mode: enrollment.course.mode || 'online',
            price: enrollment.course.price || 0,
            completed: enrollment.completed || false,
            nextLesson: nextLesson ? {
              title: nextLesson.title,
              duration: `${nextLesson.duration_minutes || 30} minutes`,
              date: new Date().toISOString(),
            } : {
              title: "Start Course",
              duration: "N/A",
              date: new Date().toISOString(),
            },
            image: enrollment.course.image_url || '/placeholder.svg',
          };
        }));

        return coursesWithNextLesson;
      } catch (error) {
        console.error('Error in enrolledCourses query:', error);
        toast({
          title: "Error loading courses",
          description: "There was an issue loading your enrolled courses",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Fetch certificates count
  const { data: certificatesCount } = useQuery({
    queryKey: ['certificatesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user?.id);

      if (error) {
        console.error('Error fetching certificates count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch total learning hours
  const { data: totalHours } = useQuery({
    queryKey: ['totalHours'],
    queryFn: async () => {
      try {
        if (!enrolledCourses || enrolledCourses.length === 0) return 0;
        
        const { data, error } = await supabase
          .from('courses')
          .select('duration_hours')
          .in('id', enrolledCourses.map(course => course.id));

        if (error) {
          console.error('Error fetching total hours:', error);
          return 0;
        }

        return data.reduce((acc, course) => acc + (course.duration_hours || 0), 0);
      } catch (error) {
        console.error('Error calculating total hours:', error);
        return 0;
      }
    },
    enabled: !!enrolledCourses && enrolledCourses.length > 0,
  });

  // Mock announcements data (would be replaced with actual data from backend)
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'New Course Launching: Cloud Computing Advanced',
      content: 'We\'re excited to announce a new advanced course on Cloud Computing launching next week. Early bird registration with 20% discount is now open!',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: '2',
      title: 'System Maintenance: Platform Downtime',
      content: 'We\'ll be performing system maintenance this weekend. The platform will be unavailable on Saturday from 2 AM to 5 AM (WAT).',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
  ];

  // Filter only in-progress courses for the dashboard
  const inProgressCourses = enrolledCourses?.filter(course => !course.completed && course.progress < 100) || [];

  // Stats for dashboard summary
  const stats = [
    {
      title: "Enrolled Courses",
      value: enrolledCourses?.length || 0,
      icon: <Book className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Courses",
      value: certificatesCount || 0,
      icon: <Star className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Hours Learned",
      value: totalHours || 0,
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
    },
    {
      title: "Certificates",
      value: certificatesCount || 0,
      icon: <BookOpen className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
    },
  ];

  if (coursesLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Oops, something went wrong!</h1>
        <p className="text-gray-600 mb-6">We couldn't load your dashboard data</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {profileData?.first_name || user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* In Progress Courses */}
      <h2 className="text-xl font-bold mb-4">In Progress Courses</h2>
      {inProgressCourses.length === 0 ? (
        <Card className="mb-10">
          <CardContent className="p-6 flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No courses in progress</h3>
            <p className="text-gray-500 text-center mb-6">Explore our course catalog and start your learning journey</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {inProgressCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      course.level === "beginner"
                        ? "bg-green-100 text-green-800"
                        : course.level === "intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                    {course.price && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        ${course.price}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{course.instructor.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="border-t pt-3 mt-2">
                  <p className="text-sm font-medium mb-1">Next Lesson:</p>
                  <p className="text-sm text-gray-700 line-clamp-1">{course.nextLesson.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.nextLesson.duration}
                    </span>
                    <Button 
                      asChild 
                      size="sm"
                      disabled={course.completed}
                      variant={course.completed ? "secondary" : "default"}
                    >
                      <Link to={`/courses/${course.id}`}>
                        {course.completed ? "Course Completed" : "Continue"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button 
                  asChild 
                  size="sm"
                >
                  <Link to={`/dashboard/courses/${course.id}`}>
                    Continue
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Upcoming Classes */}
      <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
      <Card className="mb-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {!enrolledCourses || enrolledCourses.length === 0 ? (
              <div className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No upcoming classes</h3>
                <p className="text-gray-500">Enroll in courses to see your class schedule</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <tr key={course.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-500">
                              {course.instructor.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${
                          course.mode === "live"
                            ? "bg-pink-100 text-pink-800"
                            : course.mode === "virtual"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {course.mode.charAt(0).toUpperCase() + course.mode.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {formatDate(course.nextLesson.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(course.nextLesson.date))} from now
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Join Class
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Announcements */}
      <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
      <Card>
        <CardContent className="p-6 space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No recent announcements</h3>
              <p className="text-gray-500">Check back later for updates</p>
            </div>
          ) : (
            announcements.map((announcement, index) => (
              <div key={announcement.id} className={`${index < announcements.length - 1 ? 'border-b pb-4' : ''} last:pb-0`}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(announcement.date))} ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {announcement.content}
                </p>
                <Button variant="link" className="text-sm p-0 h-auto">Read more</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
