import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnnouncementsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data: announcements, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_announcements')
        .select(`
          *,
          courses:course_id (title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleOpenDialog = (announcement: any = null) => {
    if (announcement) {
      setCurrentAnnouncement(announcement);
      setAnnouncementTitle(announcement.title);
      setAnnouncementContent(announcement.content);
      setSelectedCourse(announcement.course_id);
      setIsEditMode(true);
    } else {
      setCurrentAnnouncement(null);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSelectedCourse("");
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleSubmitAnnouncement = async () => {
    if (!announcementTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an announcement title.",
        variant: "destructive",
      });
      return;
    }

    if (!announcementContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter announcement content.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourse) {
      toast({
        title: "Course required",
        description: "Please select a course for this announcement.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && currentAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('course_announcements')
          .update({
            title: announcementTitle,
            content: announcementContent,
            course_id: selectedCourse
          })
          .eq('id', currentAnnouncement.id);

        if (error) throw error;
        
        toast({
          title: "Announcement updated",
          description: "The announcement has been successfully updated.",
        });
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('course_announcements')
          .insert({
            title: announcementTitle,
            content: announcementContent,
            course_id: selectedCourse
          });

        if (error) throw error;
        
        toast({
          title: "Announcement created",
          description: "Your announcement has been successfully created.",
        });
      }
      
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('course_announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Announcement deleted",
        description: "The announcement has been successfully deleted.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-red-500">Error loading announcements: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-gray-600">Manage course announcements</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="by-course">By Course</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements?.length ? (
              announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription className="flex justify-between items-center">
                      <span>Course: {announcement.courses?.title}</span>
                      <span className="text-xs flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">{announcement.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600">No announcements yet</h3>
                <p className="text-gray-500 mt-1">Create your first announcement to notify students</p>
                <Button className="mt-4" onClick={() => handleOpenDialog()}>
                  Create Announcement
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements?.filter(a => {
              const date = new Date(a.created_at);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7; // Last 7 days
            }).map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>Course: {announcement.courses?.title}</span>
                    <span className="text-xs flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{announcement.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleOpenDialog(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Other tabs would have similar content */}
      </Tabs>

      {/* Announcement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              {isEditMode ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Make changes to your announcement below." 
                : "Create a new announcement to notify course participants."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="course" className="text-sm font-medium">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Write your announcement here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAnnouncement}>
              {isEditMode ? "Update Announcement" : "Publish Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;
