import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import CurriculumManager from './course/CurriculumManager';
import { CourseBasicInfo } from './course/CourseBasicInfo';
import { CourseMediaUpload } from './course/CourseMediaUpload';
import { CourseMode } from './course/CourseMode';
import { CoursePricing } from './course/CoursePricing';
import { CourseSettings } from './course/CourseSettings';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

// Form Schema matching the backend structure
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
  additionalLanguages: z.array(z.string()).default([]),
  certificateEnabled: z.boolean().default(false),
  previewVideo: z.string().optional(),
  accessDuration: z.string().optional(),
  registrationDeadline: z.string().optional(), 
  courseStartDate: z.string().optional(), 
  classDays: z.array(z.string()).default([]),
  class_time: z.string().optional(),
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
  discountEnabled: z.boolean().default(false),
  discountedPrice: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface UploadStatus {
  file: File;
  name: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
}

const CourseEdit = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("details");
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Media states
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [materialUploads, setMaterialUploads] = useState<UploadStatus[]>([]);
  
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
      mode: "self-paced" as "self-paced" | "virtual-live", // Fixed TypeScript error here
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
      isPublished: false,
    },
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error("Error fetching course:", error);
          toast({
            title: "Error",
            description: "Failed to load course details.",
            variant: "destructive",
          });
          return;
        }

        setCourse(data);
        
        // Prepare form values
        form.reset({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "0",
          duration: data.duration_hours?.toString() || "0",
          level: data.level || "",
          category: data.category || "",
          mode: data.mode as "self-paced" | "virtual-live" || "self-paced", // Ensure proper type
          language: data.language || "English",
          multiLanguageSupport: data.multi_language_support || false,
          additionalLanguages: data.additional_languages || [],
          certificateEnabled: data.certificate_enabled || false,
          previewVideo: data.preview_video || "",
          accessDuration: data.access_duration || "",
          registrationDeadline: data.registration_deadline || undefined,
          courseStartDate: data.course_start_date || undefined,
          classDays: data.class_days || [],
          class_time: data.class_time || "",
          timezone: data.timezone || "",
          replayAccess: data.replay_access || false,
          discountEnabled: data.discounted_price ? true : false,
          discountedPrice: data.discounted_price?.toString() || "",
          isPublished: data.is_published || false,
        });
        
        setImageUrl(data.image_url || "");
        
        // Set up any existing materials
        if (data.course_materials && Array.isArray(data.course_materials)) {
          const existingMaterials = data.course_materials.map((url: string) => {
            const fileName = url.split('/').pop() || "file";
            return {
              name: fileName,
              status: 'success' as const,
              url: url,
              file: new File([], fileName) // Dummy file
            };
          });
          setMaterialUploads(existingMaterials);
        }
      } catch (error) {
        console.error("Error in fetchCourse:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred loading course details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast, form]);

  const handleImageChange = (file: File) => {
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleMaterialsChange = (files: FileList) => {
    const newMaterials = Array.from(files);
    
    const newUploads = newMaterials.map(file => ({
      file,
      name: file.name,
      status: 'idle' as const,
    }));
    
    setMaterialUploads([...materialUploads, ...newUploads]);
  };

  const uploadCourseMaterials = async () => {
    // Filter to only upload new materials
    const newMaterials = materialUploads.filter(item => item.status === 'idle');
    
    if (newMaterials.length === 0) return [];
    
    // Update status for all new materials to uploading
    setMaterialUploads(prev => 
      prev.map(item => item.status === 'idle' ? { ...item, status: 'uploading' } : item)
    );
    
    const materialUrls: string[] = [];
    
    try {
      // Skip bucket existence check as we know it exists
      for (const material of newMaterials) {
        if (!material.file) continue;
        
        const fileExt = material.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${courseId}/${fileName}`;
        
        try {
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('course-materials')
            .upload(filePath, material.file);
            
          if (uploadError) {
            // Find the index in the full materials array
            const fullIndex = materialUploads.findIndex(m => m.name === material.name && m.status === 'uploading');
            
            // Update status for this material to error
            if (fullIndex !== -1) {
              setMaterialUploads(prev => {
                const updated = [...prev];
                updated[fullIndex] = { ...updated[fullIndex], status: 'error' };
                return updated;
              });
            }
            
            console.error(`Error uploading material: ${uploadError.message}`);
            continue; // Skip to next file
          }
          
          const { data: materialData } = supabase.storage
            .from('course-materials')
            .getPublicUrl(filePath);
          
          if (materialData?.publicUrl) {
            materialUrls.push(materialData.publicUrl);
          
            // Find the index in the full materials array
            const fullIndex = materialUploads.findIndex(m => m.name === material.name && m.status === 'uploading');
            
            // Update status for this material to success
            if (fullIndex !== -1) {
              setMaterialUploads(prev => {
                const updated = [...prev];
                updated[fullIndex] = { ...updated[fullIndex], status: 'success', url: materialData.publicUrl };
                return updated;
              });
            }
          }
        } catch (error) {
          console.error(`Error processing material ${material.name}:`, error);
          
          // Find the index in the full materials array
          const fullIndex = materialUploads.findIndex(m => m.name === material.name && m.status === 'uploading');
          
          // Update status for this material to error
          if (fullIndex !== -1) {
            setMaterialUploads(prev => {
              const updated = [...prev];
              updated[fullIndex] = { ...updated[fullIndex], status: 'error' };
              return updated;
            });
          }
        }
      }
      
      return materialUrls;
    } catch (error) {
      console.error('Error uploading course materials:', error);
      return [];
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to edit a course",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let updatedImageUrl = imageUrl;
      
      // Upload new image if one was selected
      if (image) {
        try {
          // Use the standard 'course_covers' bucket
          const fileExt = image.name.split('.').pop();
          const fileName = `${courseId}_cover_${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('course_covers')
            .upload(fileName, image);
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            throw new Error(`Error uploading image: ${uploadError.message}`);
          }
          
          const { data: imageData } = supabase.storage
            .from('course_covers')
            .getPublicUrl(fileName);
            
          if (imageData?.publicUrl) {
            updatedImageUrl = imageData.publicUrl;
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload course image but proceeding with other updates.",
            variant: "destructive",
          });
        }
      }
      
      // Upload any new course materials
      let newMaterialUrls: string[] = await uploadCourseMaterials();
      
      // Get existing material URLs that were not replaced
      const existingMaterialUrls = materialUploads
        .filter(item => item.status === 'success' && item.url)
        .map(item => item.url as string);
      
      // Combine all material URLs
      const allMaterialUrls = [...existingMaterialUrls, ...newMaterialUrls];
      
      // Ensure array fields are properly initialized
      const classDays = data.classDays || [];
      const additionalLanguages = data.multiLanguageSupport ? (data.additionalLanguages || []) : [];
      
      // Prepare course data
      const courseData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        duration_hours: Number(data.duration),
        instructor_id: user.id,
        level: data.level,
        category: data.category,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multiLanguageSupport,
        additional_languages: additionalLanguages,
        certificate_enabled: data.certificateEnabled,
        preview_video: data.previewVideo,
        access_duration: data.accessDuration,
        registration_deadline: data.registrationDeadline,
        course_start_date: data.courseStartDate,
        class_days: classDays,
        class_time: data.class_time,
        timezone: data.timezone,
        replay_access: data.replayAccess,
        discounted_price: data.discountEnabled && data.discountedPrice ? Number(data.discountedPrice) : null,
        is_published: data.isPublished,
        image_url: updatedImageUrl,
        course_materials: allMaterialUrls.length > 0 ? allMaterialUrls : null,
        updated_at: new Date().toISOString()
      };
      
      // Update course in database
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId);

      if (error) {
        console.error("Error updating course:", error);
        toast({
          title: "Update Failed",
          description: `Failed to update course: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Course updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: `Failed to save course: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = () => {
    navigate(`/dashboard/courses/${courseId}/lessons/new`);
  };

  const handleLessonAdded = () => {
    toast({
      title: "Success",
      description: "Lesson added successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-bold">Course not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="text-gray-600">Manage your course details and curriculum</p>
      </div>

      <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>Update the basic information about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Course Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Course Details</h3>
                    <CourseBasicInfo form={form} />
                  </div>
                  
                  <div className="border-t pt-4">
                    {/* Course Mode */}
                    <h3 className="text-lg font-medium mb-4">Course Mode</h3>
                    <CourseMode form={form} />
                  </div>
                  
                  <div className="border-t pt-4">
                    {/* Course Pricing */}
                    <h3 className="text-lg font-medium mb-4">Course Pricing</h3>
                    <CoursePricing form={form} />
                  </div>
                  
                  <div className="border-t pt-4">
                    {/* Course Settings */}
                    <h3 className="text-lg font-medium mb-4">Course Settings</h3>
                    <CourseSettings form={form} />
                  </div>
                  
                  <div className="border-t pt-4">
                    {/* Published Status */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label htmlFor="isPublished">Published Status</Label>
                        <p className="text-sm text-gray-500">
                          When published, this course will be visible to students
                        </p>
                      </div>
                      <Switch
                        id="isPublished"
                        checked={form.watch("isPublished")}
                        onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Details"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Media</CardTitle>
                  <CardDescription>Update course images, videos, and materials</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <CourseMediaUpload
                    form={form}
                    onCoverImageChange={handleImageChange}
                    onMaterialsChange={handleMaterialsChange}
                    imageUrl={imageUrl}
                    materialUploads={materialUploads}
                    imageError={false}
                  />
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Save Media
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>

        {activeTab === "curriculum" && (
          <TabsContent value="curriculum">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Course Curriculum</h2>
                <Button onClick={handleAddLesson}>Add Lesson</Button>
              </div>
              
              <CurriculumManager 
                courseId={courseId} 
                onLessonAdded={handleLessonAdded} 
                isActive={() => false}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CourseEdit;
