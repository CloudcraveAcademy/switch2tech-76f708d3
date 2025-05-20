
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider, useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CourseMode } from "./course/CourseMode";
import { CoursePricing } from "./course/CoursePricing";
import { CourseSettings } from "./course/CourseSettings";

// Form schema
export const courseSchema = z.object({
  title: z.string().min(5, 'Title is required and should be at least 5 characters'),
  description: z.string().min(10, 'Description is required and should be at least 10 characters'),
  price: z.number().min(0, 'Price is required'),
  discountedPrice: z.number().min(0).optional(),
  duration_hours: z.number().min(1, 'Duration is required'),
  level: z.string().min(1, 'Level is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.string().default('English'),
  mode: z.enum(['virtual-live', 'self-paced']).default('self-paced'),
  multi_language_support: z.boolean().default(false),
  additional_languages: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  preview_video: z.string().optional(),
  course_materials: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  certificateEnabled: z.boolean().default(false),
  accessDuration: z.string().optional(),
  // Updated to handle date objects properly
  registrationDeadline: z.date().optional().nullable(), 
  courseStartDate: z.date().optional().nullable(),
  classDays: z.array(z.string()).optional(),
  class_time: z.string().optional(),
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
  enrollment_limit: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  target_audience: z.string().optional(),
  promotion_enabled: z.boolean().default(false),
  promotionEndDate: z.date().optional(),
  autoEnrollAfterPurchase: z.boolean().default(true),
});

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [courseMaterialFiles, setCourseMaterialFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState(false);

  // Initialize form
  const methods = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      discountedPrice: 0,
      duration_hours: 0,
      level: '',
      category: '',
      language: 'English',
      mode: 'self-paced' as const,
      multi_language_support: false,
      additional_languages: [],
      image_url: '',
      preview_video: '',
      course_materials: [],
      is_published: false,
      certificateEnabled: false,
      accessDuration: '',
      registrationDeadline: null as unknown as Date,
      courseStartDate: null as unknown as Date,
      classDays: [],
      class_time: '',
      timezone: '',
      replayAccess: false,
      enrollment_limit: 0,
      tags: [],
      prerequisites: [],
      objectives: [],
      target_audience: '',
      promotion_enabled: false,
      promotionEndDate: undefined,
      autoEnrollAfterPurchase: true,
    }
  });

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    if (!user) return;
    
    // Validate that image is provided
    if (!courseImageFile && !data.image_url) {
      setImageError(true);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Course image is required",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload course image if selected
      let imageUrl = '';
      if (courseImageFile) {
        const imagePath = `${user.id}/${Date.now()}_${courseImageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(imagePath, courseImageFile);

        if (uploadError) {
          throw new Error(`Error uploading course image: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('course-materials')
          .getPublicUrl(imagePath);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
      // Upload course materials if selected
      const courseMaterialUrls: string[] = [];
      if (courseMaterialFiles.length > 0) {
        for (const file of courseMaterialFiles) {
          const filePath = `${user.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error(`Error uploading course material ${file.name}:`, uploadError);
            continue; // Skip this file but continue with others
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('course-materials')
            .getPublicUrl(filePath);
            
          courseMaterialUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Convert form data to match the database schema
      const courseData = {
        title: data.title,
        description: data.description,
        price: data.price,
        discounted_price: data.discountedPrice,
        duration_hours: data.duration_hours,
        instructor_id: user.id,
        level: data.level,
        category: data.category,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multi_language_support,
        additional_languages: data.additional_languages,
        is_published: data.is_published,
        certificate_enabled: data.certificateEnabled,
        image_url: imageUrl,
        preview_video: data.preview_video,
        course_materials: courseMaterialUrls,
        // Convert Date objects to ISO strings for the database
        registration_deadline: data.registrationDeadline ? data.registrationDeadline.toISOString() : null,
        course_start_date: data.courseStartDate ? data.courseStartDate.toISOString() : null,
        class_days: data.classDays,
        class_time: data.class_time,
        timezone: data.timezone,
        access_duration: data.accessDuration,
        replay_access: data.replayAccess,
        // Additional fields
        enrollment_limit: data.enrollment_limit,
        tags: data.tags,
        prerequisites: data.prerequisites,
        objectives: data.objectives,
        target_audience: data.target_audience,
        promotion_enabled: data.promotion_enabled,
        promotion_end_date: data.promotionEndDate ? data.promotionEndDate.toISOString() : null,
        auto_enroll_after_purchase: data.autoEnrollAfterPurchase,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create the course
      const { data: newCourse, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Course Created",
        description: "Your course has been created successfully. Now you can add lessons.",
      });
      
      // Navigate to edit page to continue course setup
      navigate(`/dashboard/courses/${newCourse.id}/edit`);
      
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create course. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Course</h1>
          <p className="text-gray-500">Fill out the information to create your course</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/my-courses')}>
            Cancel
          </Button>
          <Button onClick={methods.handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Card>
              <CardHeader>
                <TabsList className="grid grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="mode">Course Mode</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="basic">
                  <CourseBasicInfo form={methods} />
                </TabsContent>

                <TabsContent value="media">
                  <CourseMediaUpload 
                    onCoverImageChange={(file) => {
                      setCourseImageFile(file);
                      setImageError(false);
                    }}
                    onMaterialsChange={(files) => {
                      const fileArray = Array.from(files);
                      setCourseMaterialFiles([...courseMaterialFiles, ...fileArray]);
                    }}
                    imageError={imageError}
                    form={methods}
                  />
                </TabsContent>

                <TabsContent value="mode">
                  <CourseMode form={methods} />
                </TabsContent>

                <TabsContent value="pricing">
                  <CoursePricing form={methods} />
                </TabsContent>

                <TabsContent value="settings">
                  <CourseSettings form={methods} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateCourse;
