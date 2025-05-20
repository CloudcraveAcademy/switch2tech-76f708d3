
import React, { useState } from 'react';
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CourseMode } from "./course/CourseMode";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CoursePricing } from "./course/CoursePricing";
import { CourseSettings } from "./course/CourseSettings";

// Form Schema
const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  duration: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Duration must be a valid number greater than 0",
  }),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  mode: z.enum(["self-paced", "virtual-live"]),
  language: z.string().min(1, "Language is required"),
  multiLanguageSupport: z.boolean().default(false),
  additionalLanguages: z.array(z.string()).optional(),
  certificateEnabled: z.boolean().default(false),
  previewVideo: z.string().optional(),
  accessDuration: z.string().optional(),
  registrationDeadline: z.date().optional(),
  courseStartDate: z.date().optional(),
  classDays: z.array(z.string()).optional(),
  class_time: z.string().optional(), // Using class_time instead of classSchedule
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
  discountEnabled: z.boolean().default(false),
  discountedPrice: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const CreateCourse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  // Form setup
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      duration: "0",
      level: "",
      category: "",
      mode: "self-paced",
      language: "English",
      multiLanguageSupport: false,
      additionalLanguages: [],
      certificateEnabled: false,
      previewVideo: "",
      accessDuration: "",
      registrationDeadline: undefined,
      courseStartDate: undefined,
      classDays: [],
      class_time: "",
      timezone: "",
      replayAccess: false,
      discountEnabled: false,
      discountedPrice: "",
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a course",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Form data:", data);
      
      // Prepare course data
      const courseData = {
        ...data,
        instructor_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "draft",
      };
      
      // Format date fields correctly for database
      if (courseData.registrationDeadline) {
        courseData.registrationDeadline = new Date(courseData.registrationDeadline).toISOString();
      }
      
      if (courseData.courseStartDate) {
        courseData.courseStartDate = new Date(courseData.courseStartDate).toISOString();
      }
      
      console.log("Prepared course data:", courseData);
      
      // Insert course into database
      const { data: insertedCourse, error } = await supabase
        .from("courses")
        .insert(courseData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating course:", error);
        throw error;
      }
      
      console.log("Course created successfully:", insertedCourse);
      
      // Handle cover image upload if provided
      if (coverImage && insertedCourse?.id) {
        // Check if the bucket exists, and create it if not
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('course_covers');
        
        if (bucketError && bucketError.message.includes('does not exist')) {
          // Attempt to create the bucket
          const { error: createBucketError } = await supabase.storage.createBucket('course_covers', {
            public: true
          });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
            throw createBucketError;
          }
        }
        
        const fileExt = coverImage.name.split('.').pop();
        const filePath = `${insertedCourse.id}_cover.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course_covers')
          .upload(filePath, coverImage);
          
        if (uploadError) {
          console.error("Error uploading cover image:", uploadError);
          throw uploadError;
        }
        
        // Update course with cover image URL
        const { error: updateError } = await supabase
          .from("courses")
          .update({ 
            cover_image: `${filePath}`
          })
          .eq('id', insertedCourse.id);
          
        if (updateError) {
          console.error("Error updating course with cover image:", updateError);
          throw updateError;
        }
      }
      
      toast({
        title: "Course Created",
        description: "Your course has been created successfully"
      });
      
      // Navigate to course edit page
      navigate(`/dashboard/courses/${insertedCourse.id}/edit`);
      
    } catch (error: any) {
      console.error("Course creation error:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to create course";
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error.details) {
        console.error("Error details:", error.details);
      }
      
      toast({
        title: "Course Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
          <CardDescription>
            Fill out the form below to create a new course
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {/* Course Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Course Details</h3>
                <CourseBasicInfo form={form} />
              </div>
              
              <div className="border-t pt-4">
                {/* Course Mode Section */}
                <h3 className="text-lg font-medium mb-4">Course Mode</h3>
                <CourseMode form={form} />
              </div>
              
              <div className="border-t pt-4">
                {/* Course Media Section */}
                <h3 className="text-lg font-medium mb-4">Course Media</h3>
                <CourseMediaUpload 
                  onCoverImageChange={(file) => setCoverImage(file)} 
                />
              </div>
              
              <div className="border-t pt-4">
                {/* Course Pricing Section */}
                <h3 className="text-lg font-medium mb-4">Course Pricing</h3>
                <CoursePricing form={form} />
              </div>
              
              <div className="border-t pt-4">
                {/* Course Settings Section */}
                <h3 className="text-lg font-medium mb-4">Course Settings</h3>
                <CourseSettings form={form} />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/my-courses')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
