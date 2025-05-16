
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, calculateTimeToComplete } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CourseEnrollmentService } from "@/services/CourseEnrollmentService";
import {
  BookOpen,
  FileText,
  MessageSquare,
  PlayCircle,
  CheckSquare,
  Clock,
  Download,
  Users,
  Calendar,
  List,
} from "lucide-react";

interface CourseData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  duration_hours: number;
  progress: number;
  instructor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  lessons: {
    id: string;
    title: string;
    duration_minutes: number;
    order_number: number;
    video_url: string;
    content: string;
    completed: boolean;
  }[];
  assignments: {
    id: string;
    title: string;
    description: string;
    due_date: string;
    completed: boolean;
  }[];
  materials: {
    id: string;
    title: string;
    file_url: string;
    file_type: string;
  }[];
}

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [discussionInput, setDiscussionInput] = useState("");
  const [discussions, setDiscussions] = useState<any[]>([]);

  // Fetch course data from Supabase
  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['course-details', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            image_url,
            level,
            duration_hours,
            instructor_id,
            instructor:user_profiles!instructor_id (
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        
        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_number', { ascending: true });

        if (lessonsError) throw lessonsError;
        
        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('due_date', { ascending: true });
          
        if (assignmentsError) throw assignmentsError;
        
        // Fetch materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', courseId);
          
        if (materialsError) {
          console.error("Error fetching materials: ", materialsError);
          // Initialize as empty array
          materialsData = [];
        }
        
        // Fetch enrollment data if user is logged in
        let progress = 0;
        if (user) {
          const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('progress')
            .eq('course_id', courseId)
            .eq('student_id', user.id)
            .maybeSingle();
            
          if (enrollmentData) {
            progress = enrollmentData.progress;
          }
        }
        
        // Construct full course object with related data
        const fullCourse = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description || '',
          image_url: courseData.image_url,
          level: courseData.level || 'beginner',
          duration_hours: courseData.duration_hours || 0,
          progress: progress,
          instructor: {
            id: courseData.instructor.id,
            first_name: courseData.instructor.first_name || '',
            last_name: courseData.instructor.last_name || '',
            avatar_url: courseData.instructor.avatar_url || '',
          },
          lessons: lessonsData.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration_minutes: lesson.duration_minutes || 30,
            order_number: lesson.order_number,
            video_url: lesson.video_url || '',
            content: lesson.content || '',
            completed: false // Will be updated from state
          })),
          assignments: assignmentsData.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description || '',
            due_date: assignment.due_date,
            completed: false // Placeholder, will be updated if needed
          })),
          materials: (materialsData || []).map((material: any) => ({
            id: material.id,
            title: material.title || 'Course Material',
            file_url: material.file_url || '#',
            file_type: material.file_type || 'pdf'
          }))
        };

        return fullCourse;
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error loading course",
          description: "There was a problem loading the course content",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!courseId,
  });

  // Fetch discussion posts
  useEffect(() => {
    if (courseId) {
      const fetchDiscussions = async () => {
        try {
          // This would normally fetch from a discussions table
          // For now we'll use mock data
          const mockDiscussions = [
            {
              id: "1",
              user: "Jane Smith",
              avatar: "https://i.pravatar.cc/150?img=1",
              date: new Date(Date.now() - 86400000).toISOString(),
              content: "I found the course content very helpful, especially the section on responsive design."
            },
            {
              id: "2",
              user: "John Doe",
              avatar: "https://i.pravatar.cc/150?img=2",
              date: new Date(Date.now() - 172800000).toISOString(),
              content: "Could someone explain the concept of CSS Grid in more detail? I'm still confused about how it differs from Flexbox."
            }
          ];
          setDiscussions(mockDiscussions);
        } catch (error) {
          console.error("Error fetching discussions:", error);
        }
      };
      fetchDiscussions();
    }
  }, [courseId]);

  // Fetch lesson progress for logged-in user
  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (user && courseId) {
        const progress = await CourseEnrollmentService.getStudentCourseLessonProgress(user.id, courseId);
        setLessonProgress(progress);
      }
    };

    fetchLessonProgress();
  }, [user, courseId]);

  // Set first lesson as active by default
  useEffect(() => {
    if (course?.lessons.length > 0 && !activeLesson) {
      setActiveLesson(course.lessons[0].id);
    }
  }, [course, activeLesson]);

  // Mark lesson as completed
  const markLessonComplete = async (lessonId: string) => {
    if (!user || !courseId) return;
    
    try {
      const success = await CourseEnrollmentService.trackLessonProgress(user.id, courseId, lessonId);
      
      if (success) {
        // Update local state
        setLessonProgress(prev => ({
          ...prev,
          [lessonId]: true
        }));
        
        // Refetch course data to update progress
        refetch();
        
        toast({
          title: "Progress Saved",
          description: "Your lesson progress has been recorded",
        });
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  // Calculate next lesson
  const nextLesson = course?.lessons.find(lesson => !lessonProgress[lesson.id]);

  // Determine if the course is complete
  const isCompleted = course?.lessons.every(lesson => lessonProgress[lesson.id]);

  // Submit a new discussion post
  const handleSubmitDiscussion = () => {
    if (!discussionInput.trim()) return;
    
    const newDiscussion = {
      id: `new-${Date.now()}`,
      user: user?.name || "Current User",
      avatar: "https://i.pravatar.cc/150?img=3",
      date: new Date().toISOString(),
      content: discussionInput
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setDiscussionInput("");
    
    toast({
      title: "Comment Posted",
      description: "Your comment has been added to the discussion",
    });
  };

  if (isLoading || !course) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
            <div className="mx-2">/</div>
            <div className="w-48 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full h-8 bg-gray-200 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="order-2 lg:order-1 w-full h-64 bg-gray-200 rounded"></div>
            <div className="order-1 lg:order-2 lg:col-span-2 w-full h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link to="/dashboard/my-courses" className="text-sm text-blue-600 hover:underline">
            My Courses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-sm text-gray-500">{course.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800">{course.level}</Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration_hours} hours
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.lessons.length} lessons
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your progress</p>
              <div className="flex items-center gap-2">
                <Progress value={course.progress} className="w-32 h-2" />
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
            </div>
            
            {isCompleted ? (
              <Button variant="outline" asChild>
                <Link to="/dashboard/certificates">
                  View Certificate
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <a href={`#lesson-${nextLesson?.id}`}>
                  Continue Learning
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Course Content */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <List className="h-5 w-5 mr-2" />
                Course Content
              </CardTitle>
              <CardDescription>
                {course.lessons.filter(l => lessonProgress[l.id]).length} of {course.lessons.length} lessons completed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {course.lessons.map((lesson) => (
                  <li 
                    key={lesson.id} 
                    id={`lesson-${lesson.id}`}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeLesson === lesson.id ? 'bg-gray-50' : ''}`}
                    onClick={() => setActiveLesson(lesson.id)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mr-3 mt-1 h-5 w-5 rounded-full flex items-center justify-center ${
                        lessonProgress[lesson.id] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {lessonProgress[lesson.id] ? (
                          <CheckSquare className="h-3 w-3" />
                        ) : (
                          <span className="text-xs">{lesson.order_number}</span>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          <span>{calculateTimeToComplete(lesson.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Materials Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Course Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.materials && course.materials.length > 0 ? (
                <ul className="space-y-3">
                  {course.materials.map((material) => (
                    <li key={material.id}>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a 
                          href={material.file_url} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => {
                            if (!material.file_url || material.file_url === '#') {
                              e.preventDefault();
                              toast({
                                title: "Download Failed",
                                description: "The material file is not available",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Download Started",
                                description: `${material.title} is being downloaded`,
                              });
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {material.title}
                          <Badge variant="outline" className="ml-2">
                            {material.file_type}
                          </Badge>
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No materials available for this course</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Lesson Viewer */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList>
              <TabsTrigger value="lessons">
                <PlayCircle className="h-4 w-4 mr-2" />
                Lessons
              </TabsTrigger>
              <TabsTrigger value="assignments">
                <FileText className="h-4 w-4 mr-2" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
            </TabsList>
            
            {/* Lessons Tab */}
            <TabsContent value="lessons">
              {activeLesson && (
                <div>
                  {course.lessons.filter(l => l.id === activeLesson).map(lesson => (
                    <div key={lesson.id} className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        {lesson.video_url ? (
                          <iframe 
                            src={lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? 
                              lesson.video_url.replace('watch?v=', 'embed/') : lesson.video_url}
                            className="w-full h-full rounded-lg" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            title={lesson.title}
                          />
                        ) : (
                          <div className="text-center">
                            <PlayCircle className="h-16 w-16 text-gray-400 mx-auto" />
                            <p className="mt-2 text-gray-500">Video Player: {lesson.title}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-bold">{lesson.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {calculateTimeToComplete(lesson.duration_minutes)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Lesson {lesson.order_number} of {course.lessons.length}
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose max-w-none">
                        {lesson.content ? (
                          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        ) : (
                          <p>This is a placeholder for the lesson content.</p>
                        )}
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        {lesson.order_number > 1 ? (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              const prevLesson = course.lessons.find(l => l.order_number === lesson.order_number - 1);
                              if (prevLesson) setActiveLesson(prevLesson.id);
                            }}
                          >
                            Previous Lesson
                          </Button>
                        ) : (
                          <div></div> // Empty div to maintain spacing with flex justify-between
                        )}
                        
                        {lesson.order_number < course.lessons.length ? (
                          <div className="flex gap-2">
                            {!lessonProgress[lesson.id] && (
                              <Button
                                variant="outline"
                                onClick={() => markLessonComplete(lesson.id)}
                              >
                                Mark as Complete
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                const nextLesson = course.lessons.find(l => l.order_number === lesson.order_number + 1);
                                if (nextLesson) {
                                  setActiveLesson(nextLesson.id);
                                  if (!lessonProgress[lesson.id]) {
                                    markLessonComplete(lesson.id);
                                  }
                                }
                              }}
                            >
                              Next Lesson
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              markLessonComplete(lesson.id);
                              navigate('/dashboard/my-courses');
                            }}
                          >
                            Complete Course
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Assignments Tab */}
            <TabsContent value="assignments">
              <Card>
                <CardContent className="p-0">
                  {course.assignments.length > 0 ? (
                    <ul className="divide-y">
                      {course.assignments.map((assignment) => (
                        <li key={assignment.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{assignment.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                              <div className="flex items-center mt-2 text-sm">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-gray-500">Due: {formatDate(assignment.due_date)}</span>
                              </div>
                            </div>
                            <Badge className={assignment.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {assignment.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <Button size="sm" variant={assignment.completed ? "outline" : "default"}
                              onClick={() => {
                                if (assignment.completed) {
                                  toast({
                                    title: "Assignment Completed",
                                    description: "You've already completed this assignment.",
                                  });
                                } else {
                                  toast({
                                    title: "Assignment Submission",
                                    description: "Submit your work to complete this assignment.",
                                  });
                                }
                              }}
                            >
                              {assignment.completed ? "View Submission" : "Submit Assignment"}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700">No assignments yet</h3>
                      <p className="text-gray-500 mb-4">This course doesn't have any assignments yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Discussion Tab */}
            <TabsContent value="discussion">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Join the Discussion</h3>
                    <div className="space-y-3">
                      <textarea 
                        className="w-full border rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Share your thoughts or ask a question about this course..."
                        value={discussionInput}
                        onChange={(e) => setDiscussionInput(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end">
                        <Button onClick={handleSubmitDiscussion}>Post Comment</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {discussions.length > 0 ? (
                      discussions.map((discussion) => (
                        <div key={discussion.id} className="border-t pt-4">
                          <div className="flex items-start">
                            <div className="mr-3 flex-shrink-0">
                              <img 
                                src={discussion.avatar} 
                                alt={discussion.user} 
                                className="h-8 w-8 rounded-full"
                              />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{discussion.user}</h4>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{formatDate(discussion.date)}</span>
                              </div>
                              <p className="mt-1 text-gray-700">{discussion.content}</p>
                              <div className="mt-2 flex gap-4">
                                <button className="text-xs text-gray-500 hover:text-blue-600">Reply</button>
                                <button className="text-xs text-gray-500 hover:text-blue-600">Like</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700">No discussions yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to start a conversation!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
