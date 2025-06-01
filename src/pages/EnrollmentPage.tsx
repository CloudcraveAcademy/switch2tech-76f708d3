
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
  CreditCard,
  ArrowLeft,
  Play
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

      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId);

      return {
        ...courseData,
        enrolledStudents: enrollmentCount || 0
      };
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Details
        </Button>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {enrollment ? "You're Already Enrolled!" : "Enroll in Course"}
          </h1>
          <p className="text-gray-600">
            {enrollment 
              ? "Continue your learning journey" 
              : "Complete your enrollment to start learning"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Course Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Course Image/Video */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {course.preview_video ? (
                    course.preview_video.includes('youtube.com') || course.preview_video.includes('youtu.be') ? (
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
                    )
                  ) : course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      {course.course_categories?.name || "Course"}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge variant="outline">{course.mode}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.8 (124 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolledStudents} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_hours} hours</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Instructor</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {course.user_profiles?.avatar_url ? (
                        <img 
                          src={course.user_profiles.avatar_url} 
                          alt={instructorName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {instructorName.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{instructorName}</p>
                      <p className="text-sm text-gray-500">Course Instructor</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {enrollment ? "Your Progress" : "Course Enrollment"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrollment ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600 mb-2">
                      You're enrolled in this course!
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Your progress</p>
                      <Progress value={enrollment.progress} className="h-3" />
                      <p className="text-sm text-gray-500 mt-1">{enrollment.progress}% complete</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                  >
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-600 mb-2">
                      {formatPrice(course.price || 0)}
                    </div>
                    {course.discounted_price && (
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(course.discounted_price)}
                      </div>
                    )}
                  </div>

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

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By enrolling, you agree to our terms of service
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* What's Included Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Lifetime Access</p>
                  <p className="text-sm text-gray-600">Access to all course materials forever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Video Lessons</p>
                  <p className="text-sm text-gray-600">High-quality video content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Instructor Support</p>
                  <p className="text-sm text-gray-600">Get help when you need it</p>
                </div>
              </div>
              {course.certificate_enabled && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Certificate of Completion</p>
                    <p className="text-sm text-gray-600">Earn a certificate upon completion</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
