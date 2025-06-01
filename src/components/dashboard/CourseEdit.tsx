import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CoursePricing } from "./course/CoursePricing";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CourseMode } from "./course/CourseMode";
import { CourseSettings } from "./course/CourseSettings";
import CurriculumManager from "./course/CurriculumManager";
import { CourseAnnouncements } from "./course/CourseAnnouncements";
import { useForm } from "react-hook-form";

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
  const [activeTab, setActiveTab] = useState("basic");
  const [isPublishing, setIsPublishing] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);

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
      duration_hours: 0,
    }
  });

  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          course_categories (
            id,
            name
          )
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course) {
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
        duration_hours: course.duration_hours || 0,
      };

      form.reset(formData);

      setCourseData({
        id: course.id,
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
        discounted_price: course.discounted_price || undefined,
        duration_hours: course.duration_hours || 0,
        level: course.level || "beginner",
        category: course.category || "",
        language: course.language || "English",
        mode: (course.mode as "self-paced" | "virtual-live") || "self-paced",
        multi_language_support: course.multi_language_support || false,
        additional_languages: course.additional_languages || [],
        certificate_enabled: course.certificate_enabled || false,
        registration_deadline: course.registration_deadline || "",
        course_start_date: course.course_start_date || "",
        replay_access: course.replay_access || false,
        preview_video: course.preview_video || "",
        course_materials: course.course_materials || [],
        access_duration: course.access_duration || "",
        class_days: course.class_days || [],
        class_time: course.class_time || "",
        timezone: course.timezone || "",
        is_published: course.is_published || false,
        image_url: course.image_url || "",
        instructor_id: course.instructor_id,
        created_at: course.created_at,
        updated_at: course.updated_at,
      });
    }
  }, [course, form]);

  // Save course mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!courseId) throw new Error("Course ID is required");
      
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
        duration_hours: Number(formData.duration_hours),
      };

      const { error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("id", courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
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
      if (!courseId) throw new Error("Course ID is required");
      
      const { error } = await supabase
        .from("courses")
        .update({ is_published: published })
        .eq("id", courseId);

      if (error) throw error;
    },
    onSuccess: (_, published) => {
      toast({
        title: "Success",
        description: `Course ${published ? "published" : "unpublished"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setCourseData(prev => prev ? { ...prev, is_published: published } : null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const formData = form.getValues();
    saveMutation.mutate(formData);
  };

  const handlePublishToggle = () => {
    if (!courseData) return;
    
    setIsPublishing(true);
    togglePublishMutation.mutate(!courseData.is_published, {
      onSettled: () => setIsPublishing(false),
    });
  };

  const handleCoverImageChange = async (file: File) => {
    console.log("Cover image changed:", file);
    // Handle image upload logic here
  };

  const handleMaterialsChange = (files: FileList) => {
    console.log("Materials changed:", files);
    // Handle materials upload logic here
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
        <Button onClick={() => navigate("/dashboard/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600">{courseData.title}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : courseData.is_published ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {courseData.is_published ? "Unpublish" : "Publish"}
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
                imageUrl={courseData.image_url}
                previewVideoUrl={courseData.preview_video}
                existingMaterials={courseData.course_materials}
                form={form}
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
