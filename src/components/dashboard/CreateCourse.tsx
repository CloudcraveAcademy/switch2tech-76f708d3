import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookPlus, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CourseBasicInfo } from "./course/CourseBasicInfo";
import { CoursePricing } from "./course/CoursePricing";
import { CourseMediaUpload } from "./course/CourseMediaUpload";
import { CourseMode } from "./course/CourseMode";
import { CourseSettings } from "./course/CourseSettings";

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

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
        description: "You need to be logged in to create a course",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let finalImageUrl = "";
      let materialUrls: string[] = [];
      
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
        instructor_id: user.id,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        duration_hours: Number(data.duration),
        level: data.level.toLowerCase(),
        category: data.category,
        image_url: finalImageUrl,
        is_published: false,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multiLanguageSupport,
        additional_languages: data.multiLanguageSupport ? data.additionalLanguages : null,
        certificate_enabled: data.certificateEnabled,
        preview_video: data.previewVideo,
        course_materials: materialUrls.length > 0 ? materialUrls : null,
        access_duration: data.accessDuration,
        registration_deadline: data.registrationDeadline,
        course_start_date: data.courseStartDate,
        class_days: data.classDays,
        class_time: data.classTime,
        timezone: data.timezone,
        replay_access: data.replayAccess,
        discounted_price: data.discountEnabled ? Number(data.discountedPrice) : null,
      };
      
      const { data: course, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Course created successfully",
        description: "Your course has been saved as a draft",
      });
      
      navigate(`/dashboard/courses/${course.id}/edit`);
    } catch (error: any) {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BookPlus className="mr-2" /> Create New Course
        </h1>
        <p className="text-gray-600">Fill out the form below to create a new course</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Enter the information about your course. You can edit and add more content later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <CourseBasicInfo form={form} />
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium">Course Settings</h3>
                <CourseSettings form={form} />
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium">Course Mode</h3>
                <CourseMode form={form} />
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium">Course Media</h3>
                <CourseMediaUpload 
                  form={form}
                  onImageChange={handleImageChange}
                  onMaterialsChange={handleMaterialsChange}
                  imageUrl={imageUrl}
                />
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium">Pricing</h3>
                <CoursePricing form={form} />
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
