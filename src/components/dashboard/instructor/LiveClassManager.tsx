import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Trash2, Monitor, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassSession {
  id: string;
  course_id: string;
  start_time: string;
  end_time: string;
  topic: string;
  meeting_link: string;
  status: string;
  course_title: string;
  attendance_count?: number;
}

interface Course {
  id: string;
  title: string;
}

const LiveClassManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [formData, setFormData] = useState({
    course_id: "",
    topic: "",
    meeting_link: "",
    start_date: undefined as Date | undefined,
    start_time: "",
    end_time: "",
    status: "scheduled"
  });

  // Fetch instructor's courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ['instructor-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch class sessions
  const { data: classSessions, isLoading } = useQuery<ClassSession[]>({
    queryKey: ['instructor-class-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          *,
          courses:course_id (title),
          attendance_count:class_attendance(count)
        `)
        .in('course_id', courses?.map(c => c.id) || [])
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      return data?.map(session => ({
        ...session,
        course_title: session.courses?.title || 'Unknown Course',
        attendance_count: session.attendance_count?.[0]?.count || 0
      })) || [];
    },
    enabled: !!user && !!courses?.length,
  });

  // Create class session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const startDateTime = new Date(formData.start_date!);
      const [startHour, startMinute] = formData.start_time.split(':');
      const [endHour, endMinute] = formData.end_time.split(':');
      
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const { data, error } = await supabase
        .from('class_sessions')
        .insert({
          course_id: formData.course_id,
          topic: formData.topic,
          meeting_link: formData.meeting_link,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: formData.status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-class-sessions'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Class session created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create class session");
      console.error(error);
    },
  });

  // Update class session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      if (!editingSession) return;
      
      const startDateTime = new Date(formData.start_date!);
      const [startHour, startMinute] = formData.start_time.split(':');
      const [endHour, endMinute] = formData.end_time.split(':');
      
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const { data, error } = await supabase
        .from('class_sessions')
        .update({
          course_id: formData.course_id,
          topic: formData.topic,
          meeting_link: formData.meeting_link,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: formData.status
        })
        .eq('id', editingSession.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-class-sessions'] });
      setIsEditDialogOpen(false);
      setEditingSession(null);
      resetForm();
      toast.success("Class session updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update class session");
      console.error(error);
    },
  });

  // Delete class session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-class-sessions'] });
      toast.success("Class session deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete class session");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      course_id: "",
      topic: "",
      meeting_link: "",
      start_date: undefined,
      start_time: "",
      end_time: "",
      status: "scheduled"
    });
  };

  const handleEdit = (session: ClassSession) => {
    const startDate = new Date(session.start_time);
    const endDate = new Date(session.end_time);
    
    setFormData({
      course_id: session.course_id,
      topic: session.topic,
      meeting_link: session.meeting_link,
      start_date: startDate,
      start_time: format(startDate, "HH:mm"),
      end_time: format(endDate, "HH:mm"),
      status: session.status
    });
    
    setEditingSession(session);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      updateSessionMutation.mutate(formData);
    } else {
      createSessionMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Live Class Management</h2>
          <p className="text-muted-foreground">
            Create and manage live class sessions for your courses
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Class Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Class Session</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="Class topic"
                  required
                />
              </div>

              <div>
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                  placeholder="Zoom, Google Meet, or other meeting link"
                  required
                />
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData({...formData, start_date: date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Sessions List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : classSessions?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No class sessions yet</h3>
              <p className="text-muted-foreground">Create your first live class session to get started</p>
            </CardContent>
          </Card>
        ) : (
          classSessions?.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      {session.topic}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{session.course_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteSessionMutation.mutate(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p>{format(new Date(session.start_time), "PPP")}</p>
                    <p>{format(new Date(session.start_time), "p")} - {format(new Date(session.end_time), "p")}</p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Attendance</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{session.attendance_count || 0} attendees</span>
                    </div>
                  </div>
                </div>
                
                {session.meeting_link && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(session.meeting_link, '_blank')}
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Open Meeting Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class Session</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-course">Course</Label>
              <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-topic">Topic</Label>
              <Input
                id="edit-topic"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                placeholder="Class topic"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-meeting_link">Meeting Link</Label>
              <Input
                id="edit-meeting_link"
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                placeholder="Zoom, Google Meet, or other meeting link"
                required
              />
            </div>

            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({...formData, start_date: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start_time">Start Time</Label>
                <Input
                  id="edit-start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-end_time">End Time</Label>
                <Input
                  id="edit-end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={updateSessionMutation.isPending}>
              {updateSessionMutation.isPending ? "Updating..." : "Update Session"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveClassManager;