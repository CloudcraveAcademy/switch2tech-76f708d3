import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, BookOpen } from "lucide-react";

import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CoursePricing } from "./course/CoursePricing";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CourseMode } from "./course/CourseMode";
import { CourseSettings } from "./course/CourseSettings";
import { CurriculumManager } from "./course/CurriculumManager";

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
  classTime: z.string().optional(),
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
  discountEnabled: z.boolean().default(false),
  discountedPrice: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [courseMaterials, setCourseMaterials] = useState<File[]>([]);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      duration: "",
      level: "",
      category: "",
      mode: "self-paced",
      language: "English",
      multiLanguageSupport: false,
      certificateEnabled: false,
      additionalLanguages: [],
      discountEnabled: false,
      replayAccess: false,
    },
  });
  
  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price ? course.price.toString() : "",
        duration: course.duration_hours ? course.duration_hours.toString() : "",
        level: course.level || "",
        category: course.category || "",
        mode: (course.mode === "self-paced" || course.mode === "virtual-live")
          ? course.mode
          : "self-paced",
        language: course.language || "English",
        multiLanguageSupport: course.multi_language_support || false,
        additionalLanguages: course.additional_languages || [],
        certificateEnabled: course.certificate_enabled || false,
        previewVideo: course.preview_video || "",
        accessDuration: course.access_duration || "",
        registrationDeadline: course.registration_deadline ? new Date(course.registration_deadline) : undefined,
        courseStartDate: course.course_start_date ? new Date(course.course_start_date) : undefined,
        classDays: course.class_days || [],
        classTime: course.class_time || "",
        timezone: course.timezone || "",
        replayAccess: course.replay_access || false,
        discountEnabled: course.discounted_price !== null && course.discounted_price !== undefined,
        discountedPrice: course.discounted_price ? course.discounted_price.toString() : "",
      });

      if (course.image_url) {
        setImageUrl(course.image_url);
      }
    }
  }, [course, form]);

  const handleImageChange = (file: File) => {
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleMaterialsChange = (files: FileList) => {
    setCourseMaterials(Array.from(files));
  };
  
  const onSubmit = async (data: CourseFormValues) => {
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to update a course",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let finalImageUrl = imageUrl;
      let materialUrls: string[] = course?.course_materials || [];
      
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `course-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, image);
          
        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        
        const { data: imageData } = supabase.storage.from('course-materials').getPublicUrl(filePath);
        finalImageUrl = imageData.publicUrl;
      }
      
      if (courseMaterials.length > 0) {
        for (const material of courseMaterials) {
          const fileExt = material.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `course-materials/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, material);
            
          if (uploadError) {
            throw new Error(`Error uploading material: ${uploadError.message}`);
          }
          
          const { data: materialData } = supabase.storage.from('course-materials').getPublicUrl(filePath);
          materialUrls.push(materialData.publicUrl);
        }
      }
      
      const courseData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        duration_hours: Number(data.duration),
        level: data.level.toLowerCase(),
        category: data.category,
        image_url: finalImageUrl,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multiLanguageSupport,
        additional_languages: data.multiLanguageSupport ? data.additionalLanguages : null,
        certificate_enabled: data.certificateEnabled,
        preview_video: data.previewVideo,
        course_materials: materialUrls.length > 0 ? materialUrls : null,
        access_duration: data.accessDuration,
        registration_deadline: data.registrationDeadline ? data.registrationDeadline.toISOString() : null,
        course_start_date: data.courseStartDate ? data.courseStartDate.toISOString() : null,
        class_days: data.classDays,
        class_time: data.classTime,
        timezone: data.timezone,
        replay_access: data.replayAccess,
        discounted_price: data.discountEnabled ? Number(data.discountedPrice) : null,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      
      refetch();
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const isDraft = course && !course.is_published;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-4">The requested course could not be found.</p>
        <Button onClick={() => navigate("/dashboard/my-courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/my-courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
          </Button>
          <h1 className="text-2xl font-bold mt-2">Edit Course</h1>
          <p className="text-gray-600">Manage and update your course details</p>
        </div>
        <div className="flex gap-3">
          {isDraft && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (!course) return;
                const { error } = await supabase
                  .from("courses")
                  .update({ is_published: true })
                  .eq("id", course.id);
                if (!error) {
                  toast({
                    title: "Published!",
                    description: "Your course is now live and visible to students.",
                  });
                  refetch();
                } else {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                  });
                }
              }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Publish Course
            </Button>
          )}
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="mode">Course Mode</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardContent className="pt-6">
                  <CourseBasicInfo form={form} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  <CourseSettings form={form} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mode">
              <Card>
                <CardContent className="pt-6">
                  <CourseMode form={form} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="media">
              <Card>
                <CardContent className="pt-6">
                  <CourseMediaUpload 
                    form={form}
                    onImageChange={handleImageChange}
                    onMaterialsChange={handleMaterialsChange}
                    imageUrl={imageUrl}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pricing">
              <Card>
                <CardContent className="pt-6">
                  <CoursePricing form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              {course?.id && <CurriculumManager courseId={course.id} />}
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default CourseEdit;
