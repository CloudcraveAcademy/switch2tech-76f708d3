import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Monitor, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ClassSession {
  id: string;
  course_id: string;
  start_time: string;
  end_time: string;
  topic: string;
  meeting_link: string;
  status: string;
  course_title: string;
}

const LiveClassCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Fetch enrolled courses
  React.useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (data) {
        setEnrolledCourseIds(data.map(item => item.course_id));
      }
    };
    
    fetchEnrolledCourses();
  }, [user]);

  // Fetch all class sessions for enrolled courses
  const { data: allSessions, isLoading } = useQuery<ClassSession[]>({
    queryKey: ['calendar-classes', enrolledCourseIds],
    queryFn: async () => {
      if (!enrolledCourseIds.length || !user) return [];
      
      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          *,
          courses:course_id (title)
        `)
        .in('course_id', enrolledCourseIds)
        .order('start_time', { ascending: true });
        
      if (error) throw error;

      return data?.map(session => ({
        ...session,
        course_title: session.courses?.title || 'Unknown Course'
      })) || [];
    },
    enabled: enrolledCourseIds.length > 0 && !!user,
  });

  // Get sessions for selected date
  const selectedDateSessions = allSessions?.filter(session => 
    isSameDay(new Date(session.start_time), selectedDate)
  );

  // Get dates that have sessions
  const sessionDates = allSessions?.map(session => new Date(session.start_time)) || [];

  const isSessionActive = (startTime: string) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    const diffMs = sessionStart.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes <= 15 && diffMinutes >= -120;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: async (session: ClassSession) => {
      if (!user) throw new Error("User not authenticated");

      // Check if attendance already recorded
      const { data: existing } = await supabase
        .from('class_attendance')
        .select('id')
        .eq('class_session_id', session.id)
        .eq('student_id', user.id)
        .single();

      if (existing) {
        return existing;
      }

      // Record new attendance
      const { data, error } = await supabase
        .from('class_attendance')
        .insert({
          class_session_id: session.id,
          student_id: user.id,
          course_id: session.course_id,
          attended_at: new Date().toISOString(),
          attendance_status: 'present'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Attendance recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ['calendar-classes'] });
    },
    onError: (error) => {
      console.error('Error recording attendance:', error);
      toast.error("Failed to record attendance");
    },
  });

  const handleJoinClass = (session: ClassSession) => {
    // Record attendance first
    recordAttendanceMutation.mutate(session);
    
    // Open meeting link
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Class Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasSession: sessionDates
                }}
                modifiersStyles={{
                  hasSession: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                  <span>Days with scheduled classes</span>
                </div>
              </div>
            </div>

            {/* Sessions for selected date */}
            <div>
              <h3 className="font-semibold mb-4">
                Classes for {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              
              {selectedDateSessions && selectedDateSessions.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateSessions.map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{session.topic || "Class Session"}</h4>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{session.course_title}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                            </span>
                          </div>
                          
                        </div>
                        
                        {session.meeting_link && (
                          <Button 
                            size="sm" 
                            className="w-full mt-3"
                            disabled={!isSessionActive(session.start_time)}
                            onClick={() => handleJoinClass(session)}
                          >
                            <Monitor className="mr-2 h-4 w-4" />
                            {isSessionActive(session.start_time) ? "Join Class" : "Class Not Active Yet"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-muted-foreground">No classes scheduled</h4>
                  <p className="text-sm text-muted-foreground">There are no classes scheduled for this date</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveClassCalendar;