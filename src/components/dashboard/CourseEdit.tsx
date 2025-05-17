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
import { Loader2 } from "lucide-react";
import CurriculumManager from './course/CurriculumManager';

const CourseEdit = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("details");
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

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
        setPrice(data.price);
        setIsPublished(data.is_published);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  const handleSaveDetails = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: title,
          description: description,
          price: price,
          is_published: isPublished,
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
      setIsLoading(false);
    }
  };

  const handleAddLesson = () => {
    toast({
      title: "Info",
      description: "Adding a lesson is not yet implemented.",
    });
  };

  const handleLessonAdded = () => {
    toast({
      title: "Info",
      description: "Lesson added successfully (mock).",
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
              <Button onClick={handleSaveDetails}>Save Details</Button>
            </CardContent>
          </Card>
        </TabsContent>
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Curriculum</h2>
              <Button onClick={handleAddLesson}>Add Lesson</Button>
            </div>
            
            <CurriculumManager 
              courseId={courseId} 
              onLessonAdded={handleLessonAdded} 
              isActive={() => false} // Add the missing isActive prop
            />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default CourseEdit;
