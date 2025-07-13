import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Monitor, Users, Calendar, Clock, Edit, Trash2, Search } from "lucide-react";

interface ClassSession {
  id: string;
  course_id: string;
  start_time: string;
  end_time: string;
  topic: string;
  meeting_link: string;
  status: string;
  course_title: string;
  instructor_name: string;
  attendance_count: number;
}

const LiveClassOverview = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch all class sessions for admin overview
  const { data: classSessions, isLoading } = useQuery<ClassSession[]>({
    queryKey: ['admin-class-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          *,
          courses:course_id (
            title,
            user_profiles:instructor_id (
              first_name,
              last_name
            )
          ),
          attendance_count:class_attendance(count)
        `)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      
      return data?.map(session => ({
        ...session,
        course_title: session.courses?.title || 'Unknown Course',
        instructor_name: session.courses?.user_profiles ? 
          `${session.courses.user_profiles.first_name || ''} ${session.courses.user_profiles.last_name || ''}`.trim() || 'Unknown Instructor' :
          'Unknown Instructor',
        attendance_count: session.attendance_count?.[0]?.count || 0
      })) || [];
    },
  });

  // Update session status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
      const { error } = await supabase
        .from('class_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-class-sessions'] });
      toast.success("Session status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update session status");
      console.error(error);
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-class-sessions'] });
      toast.success("Class session deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete class session");
      console.error(error);
    },
  });

  // Filter sessions based on search and status
  const filteredSessions = classSessions?.filter(session => {
    const matchesSearch = !searchTerm || 
      session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: string) => {
    updateStatusMutation.mutate({ sessionId, status: newStatus });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Live Classes Overview</h2>
        <p className="text-muted-foreground">
          Monitor and manage all live class sessions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{classSessions?.length || 0}</p>
              </div>
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {classSessions?.filter(s => s.status === 'active').length || 0}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">
                  {classSessions?.filter(s => s.status === 'scheduled' && new Date(s.start_time) > new Date()).length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendance</p>
                <p className="text-2xl font-bold">
                  {classSessions?.reduce((sum, s) => sum + s.attendance_count, 0) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No sessions found</h3>
              <p className="text-muted-foreground">No class sessions match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions?.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      {session.topic}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{session.course_title}</p>
                    <p className="text-xs text-muted-foreground">Instructor: {session.instructor_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this session?')) {
                          deleteSessionMutation.mutate(session.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="font-medium mb-1">Date & Time</p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(session.start_time), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(session.start_time), "p")} - {format(new Date(session.end_time), "p")}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Attendance</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{session.attendance_count} attendees</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Quick Actions</p>
                    <div className="flex gap-2">
                      {session.meeting_link && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(session.meeting_link, '_blank')}
                        >
                          <Monitor className="mr-1 h-3 w-3" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Change Status</p>
                    <Select
                      value={session.status}
                      onValueChange={(value) => handleStatusChange(session.id, value)}
                    >
                      <SelectTrigger className="w-full h-8">
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveClassOverview;