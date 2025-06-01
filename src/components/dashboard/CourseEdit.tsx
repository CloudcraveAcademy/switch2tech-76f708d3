import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CoursePricing } from "./course/CoursePricing";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CourseMode } from "./course/CourseMode";
import { CourseSettings } from "./course/CourseSettings";
import CurriculumManager from "./course/CurriculumManager";
import { CourseAnnouncements } from "./course/CourseAnnouncements";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  discounted_price?: number;
  duration_hours: number;
  level: string;
  category: string;
  language: string;
  mode: "self-paced" | "virtual-live";
  multi_language_support: boolean;
  additional_languages: string[];
  certificate_enabled: boolean;
  registration_deadline?: string;
  course_start_date?: string;
  replay_access: boolean;
  preview_video?: string;
  course_materials: string[];
  access_duration?: string;
  class_days: string[];
  class_time?: string;
  timezone?: string;
  is_published: boolean;
  image_url?: string;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isPublishing, setIsPublishing] = useState(false);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [materialUploads, setMaterialUploads] = useState<{
    file: File;
    name: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
  }[]>([]);
  const [imageError, setImageError] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountEnabled: false,
      discountedPrice: 0,
      level: "beginner",
      category: "",
      language: "English",
      mode: "self-paced" as "self-paced" | "virtual-live",
      multiLanguageSupport: false,
      additionalLanguages: [],
      certificateEnabled: false,
      registrationDeadline: null,
      courseStartDate: null,
      replayAccess: false,
      preview_video: "",
      accessDuration: "",
      classDays: [],
      class_time: "",
      timezone: "",
      duration: 0,
    }
  });

  console.log('CourseEdit: Component render', { 
    courseId, 
    user: user?.id, 
    authLoading,
    timestamp: new Date().toISOString()
  });

  // Early redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('CourseEdit: No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch course data
  const { data: course, isLoading, error, isError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      console.log('CourseEdit: Fetching course data', { courseId, userId: user?.id });
      
      if (!courseId) {
        throw new Error("Course ID not provided");
      }
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        console.error('CourseEdit: Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Course not found");
      }
      
      // Check if user is the instructor for this course
      if (data.instructor_id !== user.id) {
        throw new Error("You don't have permission to edit this course");
      }
      
      console.log('CourseEdit: Course data fetched successfully:', data);
      return data as CourseData;
    },
    enabled: !authLoading && !!courseId && !!user,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update form when course data is loaded
  useEffect(() => {
    if (course) {
      console.log('CourseEdit: Setting up form with course data');
      
      const formData = {
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
        discountEnabled: !!course.discounted_price,
        discountedPrice: course.discounted_price || 0,
        level: course.level || "beginner",
        category: course.category || "",
        language: course.language || "English",
        mode: (course.mode as "self-paced" | "virtual-live") || "self-paced",
        multiLanguageSupport: course.multi_language_support || false,
        additionalLanguages: course.additional_languages || [],
        certificateEnabled: course.certificate_enabled || false,
        registrationDeadline: course.registration_deadline ? new Date(course.registration_deadline) : null,
        courseStartDate: course.course_start_date ? new Date(course.course_start_date) : null,
        replayAccess: course.replay_access || false,
        preview_video: course.preview_video || "",
        accessDuration: course.access_duration || "",
        classDays: course.class_days || [],
        class_time: course.class_time || "",
        timezone: course.timezone || "",
        duration: course.duration_hours || 0,
      };

      form.reset(formData);
    }
  }, [course, form]);

  // Save course mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      console.log('CourseEdit: Saving course data:', formData);
      
      if (!courseId || !user) throw new Error("Course ID or user not available");
      
      let imageUrl = course?.image_url || '';
      
      // Upload new image if selected
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
      const newMaterialUrls = materialUploads
        .filter(upload => upload.status === 'success' && upload.url)
        .map(upload => upload.url!);
      
      const existingMaterials = course?.course_materials || [];
      const courseMaterialUrls = [...existingMaterials, ...newMaterialUrls];
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        discounted_price: formData.discountEnabled ? Number(formData.discountedPrice) : null,
        level: formData.level,
        category: formData.category,
        language: formData.language,
        mode: formData.mode,
        multi_language_support: formData.multiLanguageSupport,
        additional_languages: formData.additionalLanguages,
        certificate_enabled: formData.certificateEnabled,
        registration_deadline: formData.registrationDeadline ? formData.registrationDeadline.toISOString() : null,
        course_start_date: formData.courseStartDate ? formData.courseStartDate.toISOString() : null,
        replay_access: formData.replayAccess,
        preview_video: formData.preview_video,
        access_duration: formData.accessDuration,
        class_days: formData.classDays,
        class_time: formData.class_time,
        timezone: formData.timezone,
        duration_hours: Number(formData.duration),
        image_url: imageUrl,
        course_materials: courseMaterialUrls,
        updated_at: new Date().toISOString(),
      };

      console.log('CourseEdit: Updating course with data:', updateData);

      const { error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("id", courseId)
        .eq("instructor_id", user.id);

      if (error) {
        console.error('CourseEdit: Error updating course:', error);
        throw error;
      }
      
      console.log('CourseEdit: Course updated successfully');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      console.error('CourseEdit: Save mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  // Publish/Unpublish course
  const togglePublishMutation = useMutation({
    mutationFn: async (published: boolean) => {
      console.log('CourseEdit: Toggling publish status to:', published);
      
      if (!courseId || !user) throw new Error("Course ID or user not available");
      
      const { error } = await supabase
        .from("courses")
        .update({ is_published: published })
        .eq("id", courseId)
        .eq("instructor_id", user.id);

      if (error) {
        console.error('CourseEdit: Error toggling publish status:', error);
        throw error;
      }
      
      console.log('CourseEdit: Publish status updated successfully');
      return published;
    },
    onSuccess: (published) => {
      toast({
        title: "Success",
        description: `Course ${published ? "published" : "unpublished"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      console.error('CourseEdit: Publish toggle error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const formData = form.getValues();
    console.log('CourseEdit: Saving course with data:', formData);
    saveMutation.mutate(formData);
  };

  const handlePublishToggle = () => {
    if (!course) return;
    
    setIsPublishing(true);
    togglePublishMutation.mutate(!course.is_published, {
      onSettled: () => setIsPublishing(false),
    });
  };

  const handleCoverImageChange = async (file: File) => {
    setCourseImageFile(file);
    setImageError(false);
  };

  const handleMaterialsChange = async (files: FileList) => {
    if (!user || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
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
    if (course) {
      const updatedMaterials = course.course_materials.filter(url => url !== urlToRemove);
      queryClient.setQueryData(["course", courseId], { ...course, course_materials: updatedMaterials });
    }
    setMaterialUploads(prev => prev.filter(item => item.url !== urlToRemove));
  };

  console.log('CourseEdit: Render decision', { 
    authLoading, 
    user: !!user, 
    isLoading, 
    isError, 
    error: error?.message,
    course: !!course 
  });

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  // Show loading while course is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading course...</span>
      </div>
    );
  }

  // Show error state
  if (isError || error || !course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
        <p className="text-gray-600 mb-4">
          {error?.message || "The course you're looking for doesn't exist or you don't have permission to edit it."}
        </p>
        <Button onClick={() => navigate("/dashboard/my-courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/my-courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600">{course.title}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : course.is_published ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {course.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="mode">Mode</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseBasicInfo form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <CoursePricing form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseMediaUpload
                onCoverImageChange={handleCoverImageChange}
                onMaterialsChange={handleMaterialsChange}
                imageUrl={course.image_url}
                previewVideoUrl={course.preview_video}
                existingMaterials={course.course_materials}
                materialUploads={materialUploads}
                imageError={imageError}
                form={form}
                onMaterialRemove={handleRemoveMaterial}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mode">
          <Card>
            <CardHeader>
              <CardTitle>Course Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseMode form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSettings form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumManager 
            courseId={courseId!} 
            isActive={(path: string) => activeTab === "curriculum"}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <CourseAnnouncements courseId={courseId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEdit;
