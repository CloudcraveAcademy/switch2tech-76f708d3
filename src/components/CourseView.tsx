
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, calculateTimeToComplete } from "@/lib/utils";
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
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  // Fetch course data from Supabase
  const { data: course, isLoading } = useQuery({
    queryKey: ['course-details', courseId],
    queryFn: async () => {
      // This would be a real Supabase query in a production app
      // For now, let's return mock data
      
      // Mock course data
      const mockCourse: CourseData = {
        id: courseId || "mock-id",
        title: "Full Stack Web Development Bootcamp",
        description: "Master the latest technologies in web development with our comprehensive bootcamp covering frontend, backend, and deployment.",
        image_url: "/placeholder.svg",
        level: "intermediate",
        duration_hours: 42,
        progress: 35,
        instructor: {
          id: "inst-1",
          first_name: "Alex",
          last_name: "Johnson",
          avatar_url: ""
        },
        lessons: [
          {
            id: "lesson-1",
            title: "Introduction to Web Development",
            duration_minutes: 45,
            order_number: 1,
            video_url: "https://example.com/video1",
            content: "In this lesson, we'll cover the basics of web development and set up our development environment.",
            completed: true
          },
          {
            id: "lesson-2",
            title: "HTML & CSS Fundamentals",
            duration_minutes: 60,
            order_number: 2,
            video_url: "https://example.com/video2",
            content: "Learn the core building blocks of web pages and how to style them effectively.",
            completed: true
          },
          {
            id: "lesson-3",
            title: "JavaScript Essentials",
            duration_minutes: 75,
            order_number: 3,
            video_url: "https://example.com/video3",
            content: "Master the fundamentals of JavaScript programming and DOM manipulation.",
            completed: false
          },
          {
            id: "lesson-4",
            title: "React Fundamentals",
            duration_minutes: 90,
            order_number: 4,
            video_url: "https://example.com/video4",
            content: "Build interactive UIs with React's component-based architecture.",
            completed: false
          }
        ],
        assignments: [
          {
            id: "assignment-1",
            title: "Portfolio Website",
            description: "Create a personal portfolio website using HTML, CSS and JavaScript",
            due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
            completed: false
          },
          {
            id: "assignment-2",
            title: "React To-Do App",
            description: "Build a todo application with React and state management",
            due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days from now
            completed: false
          }
        ],
        materials: [
          {
            id: "material-1",
            title: "Web Development Roadmap 2025",
            file_url: "/files/roadmap.pdf",
            file_type: "pdf"
          },
          {
            id: "material-2",
            title: "JavaScript Cheatsheet",
            file_url: "/files/javascript-cheatsheet.pdf",
            file_type: "pdf"
          },
          {
            id: "material-3",
            title: "CSS Grid Examples",
            file_url: "/files/css-grid-examples.zip",
            file_type: "zip"
          }
        ]
      };

      // Set the first lesson as active by default
      if (mockCourse.lessons.length > 0 && !activeLesson) {
        setActiveLesson(mockCourse.lessons[0].id);
      }
      
      return mockCourse;
    },
    enabled: !!courseId,
  });

  // Calculate next lesson
  const nextLesson = course?.lessons.find(lesson => !lesson.completed);

  // Determine if the course is complete
  const isCompleted = course?.lessons.every(lesson => lesson.completed);

  if (isLoading || !course) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <p>Loading course content...</p>
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
                {course.lessons.filter(l => l.completed).length} of {course.lessons.length} lessons completed
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
                        lesson.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {lesson.completed ? (
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
              <ul className="space-y-3">
                {course.materials.map((material) => (
                  <li key={material.id}>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={material.file_url} download target="_blank" rel="noreferrer">
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
                        {/* This would be a real video player in production */}
                        <div className="text-center">
                          <PlayCircle className="h-16 w-16 text-gray-400 mx-auto" />
                          <p className="mt-2 text-gray-500">Video Player: {lesson.title}</p>
                        </div>
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
                        <p>{lesson.content}</p>
                        {/* This would contain the full lesson content in production */}
                        <p className="mt-4">
                          This is a placeholder for the full lesson content. In a real application, 
                          this would contain rich text content with formatting, code examples, images, etc.
                        </p>
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
                          <Button
                            onClick={() => {
                              const nextLesson = course.lessons.find(l => l.order_number === lesson.order_number + 1);
                              if (nextLesson) setActiveLesson(nextLesson.id);
                            }}
                          >
                            Next Lesson
                          </Button>
                        ) : (
                          <Button>Complete Course</Button>
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
                            <Button size="sm" variant={assignment.completed ? "outline" : "default"}>
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
                      <p className="text-gray-500">This course doesn't have any assignments yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Discussion Tab */}
            <TabsContent value="discussion">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">Discussion Board</h3>
                    <p className="text-gray-500 mb-4">Connect with other students and instructors in this course</p>
                    <Button>Start a Discussion</Button>
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
