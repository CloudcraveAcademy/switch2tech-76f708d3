
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
import { CurriculumManager } from "./course/CurriculumManager";
import { CourseAnnouncements } from "./course/CourseAnnouncements";

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
  mode: "self-paced" | "virtual" | "live";
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
        mode: course.mode || "self-paced",
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
  }, [course]);

  // Save course mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedData: Partial<CourseData>) => {
      if (!courseId) throw new Error("Course ID is required");
      
      const { error } = await supabase
        .from("courses")
        .update(updatedData)
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
    if (courseData) {
      saveMutation.mutate(courseData);
    }
  };

  const handlePublishToggle = () => {
    if (!courseData) return;
    
    setIsPublishing(true);
    togglePublishMutation.mutate(!courseData.is_published, {
      onSettled: () => setIsPublishing(false),
    });
  };

  const handleCoverImageChange = (file: File) => {
    // Handle image upload logic here
    console.log("Cover image changed:", file);
  };

  const handleMaterialsChange = (files: FileList) => {
    // Handle materials upload logic here
    console.log("Materials changed:", files);
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
              <CourseBasicInfo
                data={courseData}
                onChange={(updates) => setCourseData(prev => prev ? { ...prev, ...updates } : null)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <CoursePricing
                data={courseData}
                onChange={(updates) => setCourseData(prev => prev ? { ...prev, ...updates } : null)}
              />
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
              <CourseMode
                data={courseData}
                onChange={(updates) => setCourseData(prev => prev ? { ...prev, ...updates } : null)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSettings
                data={courseData}
                onChange={(updates) => setCourseData(prev => prev ? { ...prev, ...updates } : null)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumManager courseId={courseId!} />
        </TabsContent>

        <TabsContent value="announcements">
          <CourseAnnouncements courseId={courseId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEdit;
