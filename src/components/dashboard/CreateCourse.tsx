
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookPlus, Loader2 } from "lucide-react";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "UI/UX Design",
  "Cybersecurity",
  "Blockchain",
];

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Course form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title) newErrors.title = "Title is required";
    if (!description) newErrors.description = "Description is required";
    if (!price) newErrors.price = "Price is required";
    else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a valid number";
    }
    if (!duration) newErrors.duration = "Duration is required";
    else if (isNaN(Number(duration)) || Number(duration) <= 0) {
      newErrors.duration = "Duration must be a valid number";
    }
    if (!level) newErrors.level = "Level is required";
    if (!category) newErrors.category = "Category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
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
      
      // Upload image to Supabase Storage if available
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
        
        const { data } = supabase.storage.from('course-materials').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }
      
      // Create course in database
      const { data: course, error } = await supabase
        .from('courses')
        .insert([
          {
            instructor_id: user.id,
            title,
            description,
            price: Number(price),
            duration_hours: Number(duration),
            level,
            category,
            image_url: finalImageUrl,
            is_published: false, // Initially save as draft
          }
        ])
        .select('id')
        .single();
      
      if (error) {
        throw new Error(`Error creating course: ${error.message}`);
      }
      
      toast({
        title: "Course created successfully",
        description: "Your course has been saved as a draft",
      });
      
      // Redirect to course edit page
      navigate(`/dashboard/courses/${course.id}`);
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
            Enter the basic information about your course. You can edit and add more content later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
                  Course Title*
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>
                  Description*
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`min-h-[150px] ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>
                    Price (₦)*
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 10000"
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
                </div>
                
                <div>
                  <Label htmlFor="duration" className={errors.duration ? "text-destructive" : ""}>
                    Duration (hours)*
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 10"
                    className={errors.duration ? "border-destructive" : ""}
                  />
                  {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level" className={errors.level ? "text-destructive" : ""}>
                    Level*
                  </Label>
                  <Select onValueChange={setLevel}>
                    <SelectTrigger className={errors.level ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-destructive text-sm mt-1">{errors.level}</p>}
                </div>
                
                <div>
                  <Label htmlFor="category" className={errors.category ? "text-destructive" : ""}>
                    Category*
                  </Label>
                  <Select onValueChange={setCategory}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="image">Course Image (optional)</Label>
                <div className="mt-1 flex items-center space-x-4">
                  {imageUrl && (
                    <div className="shrink-0 h-20 w-32 overflow-hidden rounded-md border">
                      <img
                        src={imageUrl}
                        alt="Course preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {imageUrl ? "Change image" : "Upload image"}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
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
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
