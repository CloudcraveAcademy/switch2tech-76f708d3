
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft } from "lucide-react";

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Fetch course data
  const { data: course, isLoading } = useQuery({
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
  
  // Populate form with course data when loaded
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setPrice(course.price ? course.price.toString() : "");
      setLevel(course.level || "");
      setCategory(course.category || "");
    }
  }, [course]);
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          price: price ? parseFloat(price) : null,
          level,
          category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
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
        <Button onClick={handleSave} disabled={loading}>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea 
                    id="description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={5}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Course Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Level</SelectLabel>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="curriculum">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-10">
                <h3 className="text-lg font-medium mb-2">Curriculum Editor</h3>
                <p className="text-gray-500 mb-4">This feature is coming soon. You'll be able to add sections, lessons, and resources to your course.</p>
                <Button variant="outline" onClick={() => setActiveTab("basic")}>Back to Basic Info</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="price">Course Price (NGN)</Label>
                  <Input 
                    id="price" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)} 
                    type="number"
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter 0 for a free course</p>
                </div>
                
                <div className="text-center p-6">
                  <p className="text-gray-500 mb-4">More pricing options and course settings will be available soon.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEdit;
