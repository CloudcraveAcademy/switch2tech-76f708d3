
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  Star, 
  Globe, 
  Award, 
  CheckCircle, 
  Play,
  BookOpen,
  Calendar
} from "lucide-react";
import CourseEnrollButton from "@/components/dashboard/course/CourseEnrollButton";

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isInstructorPreview = searchParams.get('instructor') === 'true';

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-details", courseId],
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

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
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
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist or is not published.</p>
        </div>
      </Layout>
    );
  }

  const instructorName = course.user_profiles 
    ? `${course.user_profiles.first_name || ""} ${course.user_profiles.last_name || ""}`.trim()
    : "Instructor";

  const isOwnCourse = user?.id === course.instructor_id;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {course.course_categories?.name || "Course"}
              </Badge>
              <Badge variant="outline">{course.level}</Badge>
              <Badge variant="outline">{course.mode}</Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{course.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours} hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolledStudents} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>4.8 (124 reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
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
                <p className="font-medium">Instructor: {instructorName}</p>
                <p className="text-sm text-gray-600">Course Creator</p>
              </div>
            </div>
          </div>

          {/* Course Preview/Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-0">
                {/* Course Image/Video */}
                <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                  {course.image_url ? (
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

                <div className="p-6">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-brand-600">
                      {course.price === 0 ? "FREE" : `$${course.price}`}
                    </div>
                    {course.discounted_price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${course.discounted_price}
                      </div>
                    )}
                  </div>

                  {/* Enrollment/Preview Actions */}
                  <div className="space-y-3">
                    {isOwnCourse ? (
                      <div className="text-center py-4">
                        <Badge variant="secondary" className="mb-2">
                          Your Course
                        </Badge>
                        <p className="text-sm text-gray-600">
                          This is your course. Students will see the enrollment options here.
                        </p>
                      </div>
                    ) : isInstructorPreview ? (
                      <div className="text-center py-4">
                        <Badge variant="outline" className="mb-2">
                          Instructor Preview
                        </Badge>
                        <p className="text-sm text-gray-600">
                          You're viewing this as an instructor. Students will see enrollment options here.
                        </p>
                      </div>
                    ) : (
                      <CourseEnrollButton
                        courseId={courseId!}
                        courseTitle={course.title}
                        courseThumbnail={course.image_url}
                        isEnrolled={!!enrollment}
                        className="w-full"
                      />
                    )}
                  </div>

                  {/* Course Features */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{course.duration_hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-medium">{course.enrolledStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium">{course.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-medium flex items-center">
                        {course.certificate_enabled ? (
                          <>
                            <Award className="h-4 w-4 mr-1" />
                            Yes
                          </>
                        ) : (
                          "No"
                        )}
                      </span>
                    </div>
                    {course.course_start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Starts</span>
                        <span className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(course.course_start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Master the fundamentals of the subject</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Build practical projects</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Understand best practices</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Prepare for real-world applications</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Basic computer skills</li>
                    <li>• Willingness to learn</li>
                    <li>• No prior experience required</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <div className="prose prose-sm max-w-none">
                    <p>{course.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">Introduction</h4>
                          <p className="text-sm text-gray-600">3 lessons • 45 minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">Fundamentals</h4>
                          <p className="text-sm text-gray-600">5 lessons • 1 hour 30 minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">Advanced Topics</h4>
                          <p className="text-sm text-gray-600">7 lessons • 2 hours 15 minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
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
                      <span className="text-xl font-medium">
                        {instructorName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{instructorName}</h3>
                    <p className="text-gray-600 mb-4">Expert Instructor</p>
                    <p className="text-sm text-gray-600">
                      An experienced professional with years of expertise in the field.
                      Passionate about teaching and helping students achieve their goals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">4.8</div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">Based on 124 reviews</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">John D.</span>
                        <span className="text-xs text-gray-500">2 weeks ago</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Excellent course! The instructor explains everything clearly and the content is very practical.
                      </p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">Sarah M.</span>
                        <span className="text-xs text-gray-500">1 month ago</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Great learning experience. I was able to apply what I learned immediately in my work.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CourseDetails;
