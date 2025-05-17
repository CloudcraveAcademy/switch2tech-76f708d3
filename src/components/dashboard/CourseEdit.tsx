
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import CurriculumManager from './course/CurriculumManager';
import { CourseMediaUpload } from './course/CourseMediaUpload';

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  
  // Media states
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [courseMaterials, setCourseMaterials] = useState<File[]>([]);
  const [materialUploads, setMaterialUploads] = useState<UploadStatus[]>([]);
  const [previewVideo, setPreviewVideo] = useState("");

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
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price || 0);
        setIsPublished(data.is_published || false);
        setImageUrl(data.image_url || "");
        setPreviewVideo(data.preview_video || "");
        
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  const handleImageChange = (file: File) => {
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleMaterialsChange = (files: FileList) => {
    const newMaterials = Array.from(files);
    setCourseMaterials([...courseMaterials, ...newMaterials]);
    
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
    const newMaterialFiles = courseMaterials.filter((_, i) => materialUploads[i]?.status === 'idle');
    
    if (newMaterials.length === 0) return [];
    
    // Update status for all new materials to uploading
    setMaterialUploads(prev => 
      prev.map(item => item.status === 'idle' ? { ...item, status: 'uploading' } : item)
    );
    
    const materialUrls: string[] = [];
    
    try {
      for (let i = 0; i < newMaterialFiles.length; i++) {
        const material = newMaterialFiles[i];
        const fileExt = material.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `course-materials/${fileName}`;
        
        try {
          const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, material);
            
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

  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      let updatedImageUrl = imageUrl;
      
      // Upload new image if one was selected
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
        updatedImageUrl = imageData.publicUrl;
      }
      
      // Upload any new course materials
      let newMaterialUrls: string[] = await uploadCourseMaterials();
      
      // Get existing material URLs that were not replaced
      const existingMaterialUrls = materialUploads
        .filter(item => item.status === 'success' && item.url)
        .map(item => item.url as string);
      
      // Combine all material URLs
      const allMaterialUrls = [...existingMaterialUrls, ...newMaterialUrls];
      
      const { error } = await supabase
        .from('courses')
        .update({
          title: title,
          description: description,
          price: price,
          is_published: isPublished,
          image_url: updatedImageUrl,
          preview_video: previewVideo,
          course_materials: allMaterialUrls.length > 0 ? allMaterialUrls : null,
        })
        .eq('id', courseId);

      if (error) {
        console.error("Error updating course:", error);
        toast({
          title: "Error",
          description: "Failed to update course details.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Course details updated successfully.",
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
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          {/* <TabsTrigger value="students">Students</TabsTrigger> */}
        </TabsList>
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Update the basic information about your course</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="isPublished">Published</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(checked)}
                />
              </div>
              <Button onClick={handleSaveDetails} disabled={isSaving}>
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
                form={{ control: { register: () => ({}) } }}
                onImageChange={handleImageChange}
                onMaterialsChange={handleMaterialsChange}
                imageUrl={imageUrl}
                materialUploads={materialUploads}
              />
              <div className="grid gap-2">
                <Label htmlFor="previewVideo">Video URL</Label>
                <Input
                  id="previewVideo"
                  value={previewVideo}
                  placeholder="YouTube or Vimeo URL"
                  onChange={(e) => setPreviewVideo(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveDetails} disabled={isSaving}>
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
                isActive={()=>false}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CourseEdit;
