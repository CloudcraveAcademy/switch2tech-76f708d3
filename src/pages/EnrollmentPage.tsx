
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  BookOpen,
  Play,
  CreditCard 
} from "lucide-react";

const EnrollmentPage = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-enrollment", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data: courseData, error } = await supabase
        .from("courses")
        .select(`
          *,
          user_profiles (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          course_categories (
            id,
            name
          )
        `)
        .eq("id", courseId)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return courseData;
    },
    enabled: !!courseId,
  });

  // Check if user is already enrolled
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-status", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user?.id,
  });

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to enroll in courses",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/courses/${courseId}` } });
      return;
    }

    if (enrollment) {
      navigate(`/dashboard/courses/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert([{
          course_id: courseId,
          student_id: user.id,
          progress: 0,
          completed: false
        }]);

      if (error) throw error;

      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in this course. Redirecting to course...",
      });

      // Redirect to course view after successful enrollment
      setTimeout(() => {
        navigate(`/dashboard/courses/${courseId}`);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-gray-600 mb-8">The course you're looking for doesn't exist or is not available.</p>
          <Button onClick={() => navigate("/courses")}>
            Browse All Courses
          </Button>
        </div>
      </Layout>
    );
  }

  const instructorName = course.user_profiles 
    ? `${course.user_profiles.first_name || ""} ${course.user_profiles.last_name || ""}`.trim()
    : "Instructor";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {course.course_categories?.name || "Course"}
            </Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Badge variant="outline">{course.mode}</Badge>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{course.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.8 (124 reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1,234 students</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration_hours} hours</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Preview Video */}
            {course.preview_video && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Course Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {course.preview_video.includes('youtube.com') || course.preview_video.includes('youtu.be') ? (
                      <iframe
                        src={course.preview_video.replace('watch?v=', 'embed/')}
                        title="Course Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : course.preview_video.includes('vimeo.com') ? (
                      <iframe
                        src={course.preview_video.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        title="Course Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Master the fundamentals of {course.course_categories?.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Build real-world projects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Get industry-ready skills</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Receive a completion certificate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  Get a taste of what's inside this course
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Introduction to the Course</h4>
                          <p className="text-sm text-gray-500">5 minutes • Free preview</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Setting Up Your Environment</h4>
                          <p className="text-sm text-gray-500">12 minutes • Free preview</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-600">Core Concepts and Theory</h4>
                        <p className="text-sm text-gray-500">25 minutes • Locked</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  + 15 more lessons available after enrollment
                </p>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    {course.user_profiles?.avatar_url ? (
                      <img 
                        src={course.user_profiles.avatar_url} 
                        alt={instructorName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {instructorName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{instructorName}</h4>
                    <p className="text-gray-600">Senior {course.course_categories?.name} Expert</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Expert instructor with years of industry experience in {course.course_categories?.name}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-600 mb-2">
                      {formatPrice(course.price || 0)}
                    </div>
                    {course.discounted_price && (
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(course.discounted_price)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrollment ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">You're enrolled!</p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Your progress</p>
                          <Progress value={enrollment.progress} className="h-2" />
                          <p className="text-sm text-gray-500 mt-1">{enrollment.progress}% complete</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleEnrollment}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>Enrolling...</>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration_hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium capitalize">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium capitalize">{course.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate:</span>
                      <span className="font-medium">
                        {course.certificate_enabled ? "Yes" : "No"}
                      </span>
                    </div>
                    {course.access_duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Access:</span>
                        <span className="font-medium">{course.access_duration}</span>
                      </div>
                    )}
                  </div>

                  {course.course_start_date && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Course starts</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        {new Date(course.course_start_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
