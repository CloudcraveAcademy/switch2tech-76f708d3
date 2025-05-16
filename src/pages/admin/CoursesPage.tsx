import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Pencil, Trash2, Check, X, Eye, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          user_profiles:instructor_id (first_name, last_name),
          course_categories:category (name)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = 
      searchTerm === "" || 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handlePublishCourse = async (courseId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: isPublished })
        .eq('id', courseId);

      if (error) throw error;
      
      toast({
        title: isPublished ? "Course published" : "Course unpublished",
        description: `Course has been successfully ${isPublished ? 'published' : 'unpublished'}.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      
      toast({
        title: "Course deleted",
        description: "Course has been successfully deleted.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <p className="text-red-500">Error loading courses: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Course Management</h1>
      <p className="text-gray-600">Manage all courses across the platform</p>
      
      <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 items-start md:items-center">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <Input
            placeholder="Search courses..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button asChild>
            <a href="/dashboard/create-course">Create Course</a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending-review">Pending Review</TabsTrigger>
        </TabsList>

        <TabsContent value="all-courses" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses?.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={course.is_published ? "default" : "secondary"}>
                        {course.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      By {course.user_profiles?.first_name} {course.user_profiles?.last_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-sm">
                      {course.course_categories?.name}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <a href={`/dashboard/courses/${course.id}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`/dashboard/courses/${course.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handlePublishCourse(course.id, !course.is_published)}
                      >
                        {course.is_published ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Course</th>
                        <th className="text-left py-3 px-4 font-semibold">Instructor</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses?.map((course) => (
                        <tr key={course.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                {course.image_url ? (
                                  <img 
                                    src={course.image_url} 
                                    alt={course.title} 
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-sm text-gray-500">
                                  {course.description?.substring(0, 50)}
                                  {course.description && course.description.length > 50 ? "..." : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {course.user_profiles?.first_name} {course.user_profiles?.last_name}
                          </td>
                          <td className="py-3 px-4">
                            {course.course_categories?.name || "Uncategorized"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={course.is_published ? "default" : "secondary"}>
                              {course.is_published ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" asChild>
                                <a href={`/dashboard/courses/${course.id}`}>
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="outline" size="icon" asChild>
                                <a href={`/dashboard/courses/${course.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handlePublishCourse(course.id, !course.is_published)}
                              >
                                {course.is_published ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Other tab contents use similar structure as above */}
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Published Courses</CardTitle>
              <CardDescription>
                Courses that are live and available to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {/* Table content here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Courses</CardTitle>
              <CardDescription>
                Courses that are not yet published
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {/* Table content here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="pending-review">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review Courses</CardTitle>
              <CardDescription>
                Courses that are waiting for admin review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {/* Table content here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursesPage;
