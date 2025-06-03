import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  Award, 
  PlayCircle, 
  Calendar,
  Globe,
  BookOpen,
  Star,
  CheckCircle,
  User
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import CourseEnrollButton from "@/components/dashboard/course/CourseEnrollButton";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  level: string;
  duration_hours: number;
  mode: string;
  language: string;
  is_published: boolean;
  certificate_enabled: boolean;
  instructor: {
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
  };
  lessons: Array<{
    id: string;
    title: string;
    duration_minutes: number;
    order_number: number;
  }>;
  enrollments_count: number;
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:user_profiles!instructor_id (
            first_name,
            last_name,
            bio,
            avatar_url
          ),
          lessons (
            id,
            title,
            duration_minutes,
            order_number
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get enrollment count
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id);

      return {
        ...data,
        enrollments_count: count || 0
      } as Course;
    },
    enabled: !!id,
  });

  // Check if user is enrolled
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (enrollment) {
      setIsEnrolled(true);
      setIsCompleted(enrollment.completed || false);
    }
  }, [enrollment]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-700">Course not found</h1>
          <p className="text-gray-500 mt-2">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/courses")} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </Layout>
    );
  }

  const totalDuration = course.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
  const formattedDuration = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={course.image_url || '/placeholder.svg'}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </AspectRatio>
              {course.mode === 'live' && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  Live Course
                </Badge>
              )}
            </div>

            {/* Course Title and Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.level}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formattedDuration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.enrollments_count} students
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {course.language}
                </Badge>
                {course.certificate_enabled && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Certificate
                  </Badge>
                )}
              </div>
            </div>

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Course Content
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {course.lessons.length} lessons • {formattedDuration} total length
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.lessons
                    .sort((a, b) => a.order_number - b.order_number)
                    .map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}.
                          </span>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {lesson.duration_minutes}m
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructor.avatar_url || '/placeholder.svg'}
                    alt={`${course.instructor.first_name} ${course.instructor.last_name}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {course.instructor.first_name} {course.instructor.last_name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {course.instructor.bio || "Experienced instructor passionate about teaching."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </div>
                </div>

                <CourseEnrollButton
                  courseId={course.id}
                  courseTitle={course.title}
                  courseThumbnail={course.image_url}
                  isEnrolled={isEnrolled}
                  isCompleted={isCompleted}
                  className="w-full"
                />

                {!isEnrolled && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/courses">Browse More Courses</a>
                    </Button>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {course.duration_hours} hours on-demand video
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {course.enrollments_count} students enrolled
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Full lifetime access
                    </span>
                  </div>
                  {course.certificate_enabled && (
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Certificate of completion
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;
