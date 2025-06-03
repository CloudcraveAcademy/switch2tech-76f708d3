
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  };
  image: string;
}

const EnrolledCourses = () => {
  const { user } = useAuth();

  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ['enrolledCourses', user?.id],
    queryFn: async () => {
      try {
        // Fetch enrollments with course details
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

        if (enrollmentsError) throw enrollmentsError;

        // Get next lesson for each course
        const coursesWithNextLesson = await Promise.all(enrollments.map(async (enrollment) => {
          // Find the first incomplete lesson
          const { data: lessonProgress } = await supabase
            .from('student_lesson_progress')
            .select('lesson_id')
            .eq('course_id', enrollment.course.id)
            .eq('student_id', user?.id)
            .eq('completed', true);
          
          const completedLessonIds = lessonProgress?.map(p => p.lesson_id) || [];
          
          // Fetch next lesson to study
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', enrollment.course.id)
            .order('order_number', { ascending: true });
          
          let nextLesson = lessons?.find(lesson => 
            !completedLessonIds.includes(lesson.id)
          );
          
          // If all lessons completed, use the last one
          if (!nextLesson && lessons && lessons.length > 0) {
            nextLesson = lessons[lessons.length - 1];
          }

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
            } : {
              title: "Start Course",
              duration: "N/A",
            },
            image: enrollment.course.image_url || '/placeholder.svg',
          };
        }));

        return coursesWithNextLesson;
      } catch (error) {
        console.error('Error in enrolledCourses query:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">In Progress Courses</h2>
      {!enrolledCourses || enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No courses enrolled yet</h3>
            <p className="text-gray-500 text-center mb-6">Explore our course catalog and start your learning journey</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(enrolledCourses || []).map((course) => (
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
              <div className="p-4 pb-2">
                <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{course.instructor.name}</span>
                </div>
              </div>
              <div className="px-4 pb-2">
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
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button 
                  asChild 
                  className="w-full"
                  disabled={course.completed}
                  variant={course.completed ? "secondary" : "default"}
                >
                  <Link to={`/dashboard/courses/${course.id}`}>
                    {course.completed ? "Course Completed" : "Continue Learning"}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default EnrolledCourses;
