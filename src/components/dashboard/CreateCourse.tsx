
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { CourseMode } from "./course/CourseMode";
import { CoursePricing } from "./course/CoursePricing";
import { CourseSettings } from "./course/CourseSettings";

// Form schema
export const courseSchema = z.object({
  title: z.string().min(5, 'Title is required and should be at least 5 characters'),
  description: z.string().min(10, 'Description is required and should be at least 10 characters'),
  price: z.number().min(0, 'Price is required'),
  discountEnabled: z.boolean().default(false),
  discountedPrice: z.number().min(0).optional(),
  duration: z.number().min(1, 'Duration is required'),
  level: z.string().min(1, 'Level is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.string().default('English'),
  mode: z.enum(['virtual-live', 'self-paced']).default('self-paced'),
  multiLanguageSupport: z.boolean().default(false),
  additionalLanguages: z.array(z.string()).default([]),
  preview_video: z.string().optional(),
  certificateEnabled: z.boolean().default(false),
  accessDuration: z.string().optional(),
  registrationDeadline: z.date().optional().nullable(), 
  courseStartDate: z.date().optional().nullable(),
  classDays: z.array(z.string()).optional(),
  class_time: z.string().optional(),
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
});

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [courseMaterialFiles, setCourseMaterialFiles] = useState<File[]>([]);
  const [materialUploads, setMaterialUploads] = useState<{
    file: File;
    name: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
  }[]>([]);
  const [imageError, setImageError] = useState(false);
  const [courseImagePreview, setCourseImagePreview] = useState<string>('');

  // Initialize form
  const methods = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      discountEnabled: false,
      discountedPrice: 0,
      duration: 0,
      level: '',
      category: '',
      language: 'English',
      mode: 'self-paced' as const,
      multiLanguageSupport: false,
      additionalLanguages: [],
      preview_video: '',
      certificateEnabled: false,
      accessDuration: '',
      registrationDeadline: null as unknown as Date,
      courseStartDate: null as unknown as Date,
      classDays: [],
      class_time: '',
      timezone: '',
      replayAccess: false,
    }
  });

  const handleCoverImageChange = (file: File) => {
    setCourseImageFile(file);
    setImageError(false);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCourseImagePreview(previewUrl);
  };

  const handleMaterialUpload = async (files: FileList) => {
    if (!user || files.length === 0) return;
    
    // Convert FileList to array
    const fileArray = Array.from(files);
    setCourseMaterialFiles([...courseMaterialFiles, ...fileArray]);
    
    // Add files to material uploads state with 'uploading' status
    const newUploads = fileArray.map(file => ({
      file,
      name: file.name,
      status: 'uploading' as const
    }));
    
    setMaterialUploads(prev => [...prev, ...newUploads]);
    
    // Process each file upload
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Upload to Supabase Storage
        const filePath = `course-materials/${user.id}/${Date.now()}_${file.name}`;
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
  };

  const handleRemoveMaterial = (urlToRemove: string) => {
    setMaterialUploads(prev => prev.filter(item => item.url !== urlToRemove));
  };

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    if (!user) return;
    
    // Validate that image is provided
    if (!courseImageFile) {
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
      // Upload course image
      let imageUrl = '';
      if (courseImageFile) {
        const imagePath = `course-images/${user.id}/${Date.now()}_${courseImageFile.name}`;
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
      
      // Get course materials URLs from successful uploads
      const courseMaterialUrls = materialUploads
        .filter(upload => upload.status === 'success' && upload.url)
        .map(upload => upload.url!);
      
      // Convert form data to match the database schema
      const courseData = {
        title: data.title,
        description: data.description,
        price: data.price,
        discounted_price: data.discountEnabled ? data.discountedPrice : null,
        duration_hours: data.duration,
        instructor_id: user.id,
        level: data.level,
        category: data.category,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multiLanguageSupport,
        additional_languages: data.additionalLanguages,
        is_published: false,
        certificate_enabled: data.certificateEnabled,
        image_url: imageUrl,
        preview_video: data.preview_video,
        course_materials: courseMaterialUrls,
        registration_deadline: data.registrationDeadline ? data.registrationDeadline.toISOString() : null,
        course_start_date: data.courseStartDate ? data.courseStartDate.toISOString() : null,
        class_days: data.classDays,
        class_time: data.class_time,
        timezone: data.timezone,
        access_duration: data.accessDuration,
        replay_access: data.replayAccess,
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
                    onCoverImageChange={handleCoverImageChange}
                    onMaterialsChange={handleMaterialUpload}
                    imageUrl={courseImagePreview}
                    previewVideoUrl={methods.watch('preview_video')}
                    existingMaterials={materialUploads.filter(u => u.status === 'success').map(u => u.url!)}
                    materialUploads={materialUploads}
                    imageError={imageError}
                    form={methods}
                    onMaterialRemove={handleRemoveMaterial}
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
