
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
  User,
  MapPin,
  Video,
  Play,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import CourseEnrollButton from "@/components/dashboard/course/CourseEnrollButton";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import LiveCourseDetails from "@/components/course/LiveCourseDetails";
import CourseRating from "@/components/course/CourseRating";
import CourseRatingDisplay from "@/components/course/CourseRatingDisplay";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  preview_video?: string;
  price: number;
  discounted_price?: number;
  level: string;
  duration_hours: number;
  mode: string;
  language: string;
  is_published: boolean;
  certificate_enabled: boolean;
  lifetime_access?: boolean;
  course_start_date: string;
  registration_deadline: string;
  timezone: string;
  class_days: string[];
  class_time: string;
  replay_access: boolean;
  instructor?: {
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
    professional_title?: string;
    career_level?: string;
    skills?: string;
    website?: string;
    linkedin_url?: string;
    twitter_url?: string;
    github_url?: string;
    country?: string;
  } | null;
  lessons: Array<{
    id: string;
    title: string;
    duration_minutes: number;
    order_number: number;
    video_url?: string;
  }>;
  enrollments_count: number;
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:user_profiles_public!instructor_id (
            first_name,
            last_name,
            bio,
            avatar_url,
            professional_title,
            career_level,
            skills,
            website,
            linkedin_url,
            twitter_url,
            github_url
          ),
          lessons (
            id,
            title,
            duration_minutes,
            order_number,
            video_url
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
      };
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

  // Check if user has rated this course
  const { data: userRating } = useQuery({
    queryKey: ['user-course-rating', id, user?.id],
    queryFn: async () => {
      if (!user || !isEnrolled) return null;
      
      const { data, error } = await supabase
        .from('course_ratings')
        .select('*')
        .eq('course_id', id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id && isEnrolled,
  });

  useEffect(() => {
    if (enrollment) {
      setIsEnrolled(true);
      setIsCompleted(enrollment.completed || false);
    }
  }, [enrollment]);

  const handleVideoPreview = (videoUrl: string) => {
    console.log('Starting video preview with URL:', videoUrl);
    setCurrentVideoUrl(videoUrl);
    setShowVideoPreview(true);
  };

  const getPreviewVideoUrl = () => {
    // Priority: preview_video field first (set by instructor in media upload), then first lesson with video
    if (course?.preview_video) {
      console.log('Found preview video URL:', course.preview_video);
      return course.preview_video;
    }
    
    // Get first lesson with video URL as fallback
    const firstLessonWithVideo = course?.lessons
      ?.sort((a, b) => a.order_number - b.order_number)
      ?.find(lesson => lesson.video_url);
    
    if (firstLessonWithVideo?.video_url) {
      console.log('Found first lesson video URL:', firstLessonWithVideo.video_url);
      return firstLessonWithVideo.video_url;
    }
    
    console.log('No video URLs found');
    return null;
  };

  const convertToEmbedUrl = (url: string) => {
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // For other video URLs, return as is
    return url;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getDisplayPrice = () => {
    if (course?.discounted_price !== undefined && course?.discounted_price !== null && course?.discounted_price > 0) {
      return course.discounted_price;
    }
    return course?.price || 0;
  };

  const getOriginalPrice = () => {
    return course?.price || 0;
  };

  const hasDiscount = () => {
    return course?.discounted_price !== undefined && 
           course?.discounted_price !== null &&
           course?.discounted_price > 0 &&
           course?.discounted_price < course?.price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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

  const totalDuration = course?.lessons?.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0) || 0;
  const formattedDuration = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;
  const previewVideoUrl = getPreviewVideoUrl();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Media Preview */}
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                {showVideoPreview && currentVideoUrl ? (
                  isYouTubeUrl(currentVideoUrl) ? (
                    <iframe
                      src={convertToEmbedUrl(currentVideoUrl)}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover rounded-lg"
                      onEnded={() => setShowVideoPreview(false)}
                    />
                  )
                ) : previewVideoUrl ? (
                  <div className="relative">
                    <img
                      src={course.image_url || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                      <Button
                        onClick={() => handleVideoPreview(previewVideoUrl)}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-4"
                        size="lg"
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-blue-600 text-white">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Preview Available
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <img
                    src={course.image_url || '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </AspectRatio>
              {course.mode === 'virtual-live' && (
                <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                  <Video className="h-3 w-3 mr-1" />
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

            {/* Live Course Details - Show if mode is virtual-live */}
            {course.mode === 'virtual-live' && (
              <LiveCourseDetails course={course} />
            )}

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
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          {lesson.video_url && index === 0 && (
                            <Button
                              onClick={() => handleVideoPreview(lesson.video_url!)}
                              variant="outline"
                              size="sm"
                              className="ml-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 shrink-0"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          )}
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

            {/* Course Rating Display */}
            <CourseRatingDisplay courseId={course.id} />

            {/* Instructor */}
            {course.instructor && (
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
                      src={course.instructor?.avatar_url || '/placeholder.svg'}
                      alt={`${course.instructor?.first_name || ''} ${course.instructor?.last_name || ''}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg">
                          {course.instructor?.first_name} {course.instructor?.last_name}
                        </h3>
                        {course.instructor?.professional_title && (
                          <p className="text-brand-600 font-medium">
                            {course.instructor.professional_title}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {course.instructor?.career_level && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {course.instructor.career_level}
                            </div>
                          )}
                        </div>
                      </div>

                      {course.instructor?.bio && (
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {course.instructor.bio}
                        </p>
                      )}

                      {course.instructor?.skills && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Skills & Expertise</p>
                          <div className="flex flex-wrap gap-1">
                            {course.instructor.skills.split(',').map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="flex items-center gap-3">
                        {course.instructor?.website && (
                          <a
                            href={course.instructor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                        {course.instructor?.linkedin_url && (
                          <a
                            href={course.instructor.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                        {course.instructor?.github_url && (
                          <a
                            href={course.instructor.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                          >
                            <Github className="h-3 w-3" />
                            GitHub
                          </a>
                        )}
                        {course.instructor?.twitter_url && (
                          <a
                            href={course.instructor.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700"
                          >
                            <Twitter className="h-3 w-3" />
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {getDisplayPrice() > 0 ? (
                    <div>
                      {hasDiscount() ? (
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-brand-600">
                            {formatPrice(getDisplayPrice())}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg line-through text-gray-500">
                              {formatPrice(getOriginalPrice())}
                            </span>
                            <Badge className="bg-red-500 text-white">
                              {Math.round(((getOriginalPrice() - getDisplayPrice()) / getOriginalPrice()) * 100)}% OFF
                            </Badge>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            You save {formatPrice(getOriginalPrice() - getDisplayPrice())}!
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-brand-600">
                          {formatPrice(getDisplayPrice())}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-brand-600">Free</div>
                  )}
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
                      {course.duration_hours} hours {course.mode === 'self-paced' ? 'on-demand video' : 'of live classes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {course.enrollments_count} students enrolled
                    </span>
                  </div>
                  {(course as any).lifetime_access && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Full lifetime access
                      </span>
                    </div>
                  )}
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

            {/* Rating Component for Enrolled Students */}
            {user && (
              <CourseRating
                courseId={course.id}
                isEnrolled={isEnrolled}
                currentRating={userRating ? {
                  rating: userRating.rating,
                  review: userRating.review || undefined
                } : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;
