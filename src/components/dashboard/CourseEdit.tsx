
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import CurriculumManager from "./course/CurriculumManager";
import { CourseMode } from "./course/CourseMode";
import { CoursePricing } from "./course/CoursePricing";
import { CourseSettings } from "./course/CourseSettings";
import { CourseAnnouncements } from "./course/CourseAnnouncements";

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
  classDays: z.array(z.string()).default([]),
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
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [coursePreviewVideoFile, setCoursePreviewVideoFile] = useState<File | null>(null);
  const [courseMaterialFiles, setCourseMaterialFiles] = useState<File[]>([]);

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

  // Load course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id || !user) return;

      try {
        const { data: course, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .eq('instructor_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (course) {
          // Convert date strings to Date objects
          const formattedCourse = {
            ...course,
            registrationDeadline: course.registration_deadline ? new Date(course.registration_deadline) : null,
            courseStartDate: course.course_start_date ? new Date(course.course_start_date) : null,
            promotionEndDate: course.promotion_end_date ? new Date(course.promotion_end_date) : undefined,
            // Map database fields to form fields
            certificateEnabled: course.certificate_enabled || false,
            replayAccess: course.replay_access || false,
            discountedPrice: course.discounted_price || 0,
            enrollment_limit: course.enrollment_limit || 0,
            additional_languages: course.additional_languages || [],
            course_materials: course.course_materials || [],
            tags: course.tags || [],
            prerequisites: course.prerequisites || [],
            objectives: course.objectives || [],
            target_audience: course.target_audience || '',
            promotion_enabled: course.promotion_enabled || false,
            autoEnrollAfterPurchase: course.auto_enroll_after_purchase !== false, // default to true
            accessDuration: course.access_duration || '',
          };
          
          methods.reset(formattedCourse as any);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, methods.reset, toast]);

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    if (!id || !user) return;
    
    setSubmitting(true);
    
    try {
      // Upload course image if selected
      let imageUrl = data.image_url;
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
      
      // Upload preview video if selected
      let previewVideoUrl = data.preview_video;
      if (coursePreviewVideoFile) {
        const videoPath = `${user.id}/${Date.now()}_${coursePreviewVideoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(videoPath, coursePreviewVideoFile);
          
        if (uploadError) {
          throw new Error(`Error uploading preview video: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('course-materials')
          .getPublicUrl(videoPath);
          
        previewVideoUrl = publicUrlData.publicUrl;
      }
      
      // Upload course materials if selected
      let courseMaterialUrls = [...data.course_materials];
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
        preview_video: previewVideoUrl,
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
        updated_at: new Date().toISOString(),
      };
      
      // Update the course
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully.",
      });
      
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update course. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p>Loading course information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <p className="text-gray-500">Update your course information and content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/my-courses')}>
            Cancel
          </Button>
          <Button onClick={methods.handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Card>
              <CardHeader>
                <TabsList className="grid grid-cols-2 md:grid-cols-7">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="mode">Course Mode</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="basic">
                  <CourseBasicInfo form={methods} />
                </TabsContent>

                <TabsContent value="media">
                  <CourseMediaUpload 
                    onCoverImageChange={(file) => setCourseImageFile(file)}
                    onMaterialsChange={(files) => {
                      const fileArray = Array.from(files);
                      setCourseMaterialFiles([...courseMaterialFiles, ...fileArray]);
                    }}
                    imageUrl={methods.getValues('image_url')}
                    form={methods}
                  />
                </TabsContent>

                <TabsContent value="curriculum">
                  {id && <CurriculumManager courseId={id} isActive={true} />}
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

                <TabsContent value="announcements">
                  {id && <CourseAnnouncements courseId={id} />}
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </form>
      </FormProvider>
    </div>
  );
};

export default CourseEdit;
