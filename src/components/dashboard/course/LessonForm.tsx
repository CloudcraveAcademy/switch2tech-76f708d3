
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema
const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  video_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  duration_minutes: z.string().refine(
    (val) => !val || (Number(val) > 0 && Number(val) <= 1440),
    { message: "Duration must be between 1 and 1440 minutes" }
  ),
  order_number: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

const LessonForm: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = lessonId !== 'new';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);

  // Initialize form
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      content: '',
      video_url: '',
      duration_minutes: '',
      order_number: '1',
    },
  });

  // Fetch lesson details if in edit mode, or get next lesson order number
  useEffect(() => {
    const fetchLessonDetails = async () => {
      setIsLoading(true);

      try {
        // Guard clause to make sure courseId is defined
        if (!courseId) {
          toast({
            title: "Error",
            description: "Course ID is missing",
            variant: "destructive",
          });
          navigate('/dashboard/');
          return;
        }

        if (isEditMode && lessonId) {
          // We're editing an existing lesson
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

          if (lessonError) throw lessonError;

          if (lessonData) {
            // Check if this user is allowed to edit this lesson
            const { data: courseData, error: courseError } = await supabase
              .from('courses')
              .select('instructor_id')
              .eq('id', lessonData.course_id)
              .single();

            if (courseError) throw courseError;

            if (courseData.instructor_id !== user?.id) {
              toast({
                title: "Access Denied",
                description: "You don't have permission to edit this lesson",
                variant: "destructive",
              });
              navigate(`/dashboard/courses/${courseId}/edit`);
              return;
            }

            // Fill the form with existing data
            form.reset({
              title: lessonData.title || '',
              content: lessonData.content || '',
              video_url: lessonData.video_url || '',
              duration_minutes: lessonData.duration_minutes?.toString() || '',
              order_number: lessonData.order_number?.toString() || '1',
            });
          }
        } else {
          // We're creating a new lesson, so get the next order number
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('order_number')
            .eq('course_id', courseId)
            .order('order_number', { ascending: false });

          if (lessonsError) throw lessonsError;

          // Get highest order number and add 1, or start at 1
          const highestOrder = lessonsData && lessonsData.length > 0 
            ? Math.max(...lessonsData.map(l => l.order_number || 0)) 
            : 0;
            
          setNextOrderNumber(highestOrder + 1);
          form.setValue('order_number', (highestOrder + 1).toString());
        }
      } catch (error: any) {
        console.error('Error fetching lesson details:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load lesson details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonDetails();
  }, [isEditMode, lessonId, courseId, navigate, toast, form, user?.id]);

  const onSubmit = async (data: LessonFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to manage lessons",
        variant: "destructive",
      });
      return;
    }

    // Ensure courseId is defined before proceeding
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID is missing",
        variant: "destructive",
      });
      return;
    }

    // Verify the user is the instructor for this course
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      if (courseData.instructor_id !== user.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage lessons for this course",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      console.error('Error verifying instructor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify instructor permissions",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare lesson data
      const lessonData = {
        title: data.title,
        content: data.content || null,
        video_url: data.video_url || null,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
        order_number: parseInt(data.order_number || nextOrderNumber.toString()),
        course_id: courseId,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (isEditMode && lessonId) {
        // Update existing lesson
        result = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lessonId);
      } else {
        // Insert new lesson
        result = await supabase
          .from('lessons')
          .insert([lessonData])
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: isEditMode
          ? "Lesson updated successfully"
          : "Lesson created successfully",
      });

      // Navigate back to course edit page
      navigate(`/dashboard/courses/${courseId}/edit`);

    } catch (error: any) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save lesson",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Lesson' : 'Create New Lesson'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update this lesson\'s content and settings'
              : 'Add a new lesson to your course curriculum'}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter lesson title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter lesson content, instructions, or notes here" 
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      You can use markdown formatting in the content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/video" 
                        type="url"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to YouTube, Vimeo, or other video platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min="1"
                            max="1440"
                            placeholder="e.g. 45" 
                            {...field} 
                          />
                          <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Lesson position" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Position of this lesson in the curriculum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/courses/${courseId}/edit`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Lesson' : 'Create Lesson'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default LessonForm;
