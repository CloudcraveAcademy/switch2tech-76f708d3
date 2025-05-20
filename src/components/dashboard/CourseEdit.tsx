
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  mode: z.enum(['virtual-live', 'self-paced']),
  multi_language_support: z.boolean().default(false),
  additional_languages: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  preview_video: z.string().optional(),
  course_materials: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  certificateEnabled: z.boolean().default(false),
  accessDuration: z.string().optional(),
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
  promotionEndDate: z.date().optional().nullable(),
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
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [materialUploads, setMaterialUploads] = useState<{
    file: File;
    name: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
  }[]>([]);

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
      promotionEndDate: null as unknown as Date,
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
          console.log("Course data:", course);
          // Convert date strings to Date objects
          const formattedCourse = {
            ...course,
            registrationDeadline: course.registration_deadline ? new Date(course.registration_deadline) : null,
            courseStartDate: course.course_start_date ? new Date(course.course_start_date) : null,
            promotionEndDate: course.promotion_end_date ? new Date(course.promotion_end_date) : null,
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
            mode: course.mode || 'self-paced',
          };
          
          methods.reset(formattedCourse);
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

  const handleRemoveMaterial = (urlToRemove: string) => {
    const currentMaterials = methods.getValues('course_materials') || [];
    const updatedMaterials = currentMaterials.filter(url => url !== urlToRemove);
    methods.setValue('course_materials', updatedMaterials);
  };

  const handleMaterialUpload = async (files: File[]) => {
    if (!id || !user || files.length === 0) return;
    
    // Add files to material uploads state with 'idle' status
    const newUploads = files.map(file => ({
      file,
      name: file.name,
      status: 'uploading' as const
    }));
    
    setMaterialUploads(prev => [...prev, ...newUploads]);
    
    // Process each file upload
    const updatedMaterialUrls = [...methods.getValues('course_materials')];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Set status to uploading
        setMaterialUploads(prev => 
          prev.map(item => 
            item.name === file.name 
              ? { ...item, status: 'uploading' as const } 
              : item
          )
        );
        
        // Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, file);
          
        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);
          
        // Add URL to course materials
        updatedMaterialUrls.push(publicUrlData.publicUrl);
        
        // Update status to success
        setMaterialUploads(prev => 
          prev.map(item => 
            item.name === file.name 
              ? { ...item, status: 'success' as const, url: publicUrlData.publicUrl } 
              : item
          )
        );
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        
        // Update status to error
        setMaterialUploads(prev => 
          prev.map(item => 
            item.name === file.name 
              ? { ...item, status: 'error' as const } 
              : item
          )
        );
      }
    }
    
    // Update form with new URLs
    methods.setValue('course_materials', updatedMaterialUrls);
  };

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
        course_materials: data.course_materials,
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

      // Clear uploaded files state after successful update
      setCourseMaterialFiles([]);
      setCourseImageFile(null);
      setCoursePreviewVideoFile(null);
      
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

  const handlePublishCourse = async () => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update form state
      methods.setValue('is_published', true);
      
      toast({
        title: "Course Published",
        description: "Your course is now live and available for enrollment.",
      });
      
      setPublishDialogOpen(false);
    } catch (error: any) {
      console.error('Error publishing course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to publish course. Please try again later.",
      });
    }
  };

  const handleUnpublishCourse = async () => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update form state
      methods.setValue('is_published', false);
      
      toast({
        title: "Course Unpublished",
        description: "Your course has been unpublished and is no longer visible to students.",
      });
    } catch (error: any) {
      console.error('Error unpublishing course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to unpublish course. Please try again later.",
      });
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
          {methods.watch('is_published') ? (
            <Button variant="outline" onClick={handleUnpublishCourse}>
              Unpublish
            </Button>
          ) : (
            <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700">
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Publishing this course will make it visible to students and allow them to enroll. Are you sure you want to publish this course?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePublishCourse}>Publish</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
                      handleMaterialUpload(fileArray);
                    }}
                    imageUrl={methods.getValues('image_url')}
                    existingMaterials={methods.getValues('course_materials')}
                    materialUploads={materialUploads}
                    onMaterialRemove={handleRemoveMaterial}
                    form={methods}
                  />
                </TabsContent>

                <TabsContent value="curriculum">
                  {id && <CurriculumManager courseId={id} isActive={activeTab === "curriculum"} />}
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
