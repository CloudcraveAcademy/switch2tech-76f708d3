
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Clock, File, Play, Star, Users, Video, BookOpen, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const navigate = useNavigate();

  // Figure out user role
  let userRole: string | undefined = undefined;
  if (user && "role" in user) {
    userRole = user.role;
  }

  const { data: course, isLoading } = useQuery({
    queryKey: ["public-course", id],
    queryFn: async () => {
      if (!id) return null;
      const { data: courseData, error } = await supabase
        .from("courses")
        .select(
          `
            *,
            user_profiles (
              id,
              first_name,
              last_name,
              avatar_url,
              bio
            ),
            course_categories (
              id,
              name
            )
          `
        )
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !courseData) return null;

      const { data: lessonRows } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_number", { ascending: true });

      let curriculum = [];
      let previewLessons = [];
      if (lessonRows && lessonRows.length) {
        // Get first two lessons as teasers
        previewLessons = lessonRows.slice(0, 2);
        
        curriculum = [
          {
            id: "section-main",
            title: "Course Content",
            lessons: lessonRows.map(l => ({
              id: l.id,
              title: l.title,
              duration: l.duration_minutes ? `${l.duration_minutes} min` : "N/A",
              type: "video",
              isPreview: lessonRows.indexOf(l) < 2 // First two are preview
            }))
          }
        ];
      }

      return {
        ...courseData,
        category_name: courseData.course_categories?.name || "",
        rating: 4.8,
        reviews: 12,
        enrolledStudents: 324,
        duration:
          courseData.duration_hours !== null && courseData.duration_hours !== undefined
            ? `${courseData.duration_hours}h`
            : "N/A",
        instructor: courseData.user_profiles && {
          name: `${courseData.user_profiles.first_name || ""} ${courseData.user_profiles.last_name || ""}`.trim(),
          avatar: courseData.user_profiles.avatar_url || "",
          bio: courseData.user_profiles.bio || "",
        },
        curriculum,
        previewLessons
      };
    },
    enabled: !!id,
  });

  // Check enrollment status
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-status", id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", id)
        .eq("student_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-lg font-medium">Loading course...</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Course not found</h1>
          <p className="mb-8">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const levelColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  }[course?.level];

  const modeColor = {
    "self-paced": "bg-blue-100 text-blue-800",
    "virtual": "bg-purple-100 text-purple-800",
    "live": "bg-pink-100 text-pink-800",
  }[course?.mode];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const requirements = [
    "Basic knowledge of computer operations",
    course.level !== "beginner" ? "Prior programming experience" : "No prior programming experience needed",
    "A computer with internet access",
    "Willingness to learn and practice",
  ];

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title="Course Preview"
          allowFullScreen
          className="w-full h-48 md:h-56 rounded-lg"
        />
      );
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title="Course Preview"
          allowFullScreen
          className="w-full h-48 md:h-56 rounded-lg"
        />
      );
    }
    return (
      <div className="w-full h-48 bg-gray-200 flex justify-center items-center rounded-lg">
        <Play className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Badge className="mb-4">{course.category_name || "Uncategorized"}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-lg text-gray-700 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Badge className={levelColor}>{course.level || "All Levels"}</Badge>
                <Badge className={modeColor}>{course.mode || "Self-paced"}</Badge>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{course.rating}</span>
                  <span className="text-gray-500 ml-1">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="w-5 h-5 mr-1" />
                  <span>{course.enrolledStudents} students</span>
                </div>
              </div>

              <div className="flex items-center mb-8">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor?.avatar || undefined} />
                  <AvatarFallback>
                    {course.instructor?.name?.substring(0, 2).toUpperCase() || "IN"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{course.instructor?.name || "Instructor"}</p>
                  <p className="text-sm text-gray-500">Course Instructor</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="relative mb-6 rounded-lg overflow-hidden">
                  {course.preview_video
                    ? renderVideo(course.preview_video)
                    : (course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex justify-center items-center rounded-lg">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-brand-600 mb-4">
                    {formatPrice(course.price || 0)}
                  </p>
                  {course.discounted_price && (
                    <p className="text-lg text-gray-500 line-through mb-2">
                      {formatPrice(course.discounted_price)}
                    </p>
                  )}
                  
                  {enrollment ? (
                    <Button className="w-full mb-4" onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
                      Continue Learning
                    </Button>
                  ) : (
                    // Enroll Now button: visible ONLY for students (role 'student') or unauthenticated users
                    (userRole === undefined || userRole === 'student') && (
                      <Button 
                        className="w-full mb-4"
                        onClick={() => navigate(`/enroll/${course.id}`)}
                      >
                        Enroll Now
                      </Button>
                    )
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (course.category) {
                        navigate(`/courses?category=${course.category}`);
                      } else {
                        navigate("/courses");
                      }
                    }}
                  >
                    View Similar Courses
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-5 w-5 mr-2" /> Course Duration
                    </span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Video className="h-5 w-5 mr-2" /> Total Lessons
                    </span>
                    <span className="font-medium">
                      {course.curriculum && course.curriculum.length > 0
                        ? course.curriculum[0].lessons.length
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <File className="h-5 w-5 mr-2" /> Certificate
                    </span>
                    <span className="font-medium">{course.certificate_enabled ? "Yes" : "No"}</span>
                  </div>
                  {course.access_duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" /> Access Duration
                      </span>
                      <span className="font-medium">{course.access_duration}</span>
                    </div>
                  )}
                  {course.course_start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" /> Start Date
                      </span>
                      <span className="font-medium">
                        {new Date(course.course_start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Preview Lessons Section */}
        {course.previewLessons && course.previewLessons.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Get a taste of this course</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.previewLessons.map((lesson, index) => (
                <div key={lesson.id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-600" />
                      <Badge variant="secondary">Preview {index + 1}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {lesson.duration_minutes} min
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {lesson.content ? lesson.content.substring(0, 100) + "..." : "Preview this lesson to get started with the course content."}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Preview
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Course Description</h3>
              <p className="text-gray-700">
                {course.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.curriculum && course.curriculum.length > 0 && course.curriculum[0].lessons.length > 0 ? (
                  course.curriculum[0].lessons.map((lesson, i) => (
                    <div key={lesson.id} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{lesson.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Course lessons will be revealed soon.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="text-gray-700">{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Who This Course is For</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">
                  {course.level === "beginner"
                    ? "Complete beginners with no prior experience"
                    : "Individuals with some background knowledge seeking to advance their skills"}
                </li>
                <li className="text-gray-700">Professionals looking to transition into a tech career</li>
                <li className="text-gray-700">Students who want to supplement their academic learning with practical skills</li>
                <li className="text-gray-700">Tech enthusiasts who want to expand their knowledge base</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="curriculum">
            <div>
              <h3 className="text-xl font-bold mb-4">Course Content</h3>
              <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600">
                <div>
                  {course.curriculum && course.curriculum.length > 0 ? course.curriculum[0].lessons.length : 0} lessons
                </div>
                <div>•</div>
                <div>{course.duration} total length</div>
                <div>•</div>
                <div>{course.curriculum ? course.curriculum.length : 1} sections</div>
              </div>
              {course.curriculum && course.curriculum.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {course.curriculum.map((section, idx) => (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger className="hover:bg-gray-50 px-4">
                        <div className="flex justify-between w-full pr-4">
                          <div className="font-medium">
                            Section {idx + 1}: {section.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {section.lessons.length} lessons
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 px-4">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center">
                                <Play className="h-4 w-4 text-brand-600 mr-3" />
                                <span>{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {lesson.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-gray-500">Curriculum will be updated soon.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="instructor">
            <div className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={course.instructor?.avatar || undefined} />
                  <AvatarFallback>
                    {course.instructor?.name?.substring(0, 2).toUpperCase() || "IN"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold">{course.instructor?.name || "Instructor"}</h3>
                  <p className="text-gray-600">Senior {course.category_name} Expert</p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-3">About the Instructor</h4>
                <p className="text-gray-700 mb-4">
                  {course.instructor?.bio || 
                    `With years of experience, ${course.instructor?.name || "the instructor"} is a leading expert in ${course.category_name}.`}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-5xl font-bold text-brand-600 mb-2">{course.rating}</p>
                  <div className="flex justify-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(course.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{course.reviews} reviews</p>
                </div>

                <div className="md:w-2/3 space-y-6">
                  <div className="text-center text-gray-500">
                    Reviews will appear here soon.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
              <p className="text-gray-600 mb-4 md:mb-0">Enroll now to get access to all course materials and instructor support.</p>
            </div>
            <div className="flex gap-4">
              {enrollment ? (
                <Button size="lg" onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
                  Continue Learning
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate(`/enroll/${course.id}`)}>
                  Enroll Now
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (course.category) {
                    navigate(`/courses?category=${course.category}`);
                  } else {
                    navigate("/courses");
                  }
                }}
              >
                View Similar Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;
