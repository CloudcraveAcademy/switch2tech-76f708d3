
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Monitor, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
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

function LiveClassSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  useEffect(() => {
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

  const { data: upcomingClasses, isLoading } = useQuery<ClassSession[]>({
    queryKey: ['upcoming-classes', enrolledCourseIds],
    queryFn: async () => {
      if (!enrolledCourseIds.length || !user) return [];
      
      // Fetch upcoming classes directly from the class_sessions table
      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          *,
          courses:course_id (title)
        `)
        .in('course_id', enrolledCourseIds)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
        
      if (error) {
        console.error("Error fetching upcoming classes:", error);
        throw error;
      }

      // Process data to include the course title
      return data.map(session => ({
        ...session,
        course_title: session.courses.title
      })) || [];
    },
    enabled: enrolledCourseIds.length > 0 && !!user,
  });

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // Check if attendance already recorded
      const { data: existingAttendance } = await supabase
        .from('class_attendance')
        .select('id')
        .eq('class_session_id', sessionId)
        .eq('student_id', user.id)
        .single();
        
      if (existingAttendance) {
        return existingAttendance;
      }
      
      // Record new attendance
      const { data, error } = await supabase
        .from('class_attendance')
        .insert({
          class_session_id: sessionId,
          student_id: user.id,
          course_id: upcomingClasses?.find(c => c.id === sessionId)?.course_id,
          attendance_status: 'present',
          attended_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Attendance recorded successfully");
      queryClient.invalidateQueries({ queryKey: ['upcoming-classes'] });
    },
    onError: (error) => {
      console.error("Failed to record attendance:", error);
      toast.error("Failed to record attendance");
    },
  });

  const isSessionActive = (startTime: string) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    // Session is active 15 minutes before start time
    const diffMs = sessionStart.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes <= 15 && diffMinutes >= -120; // Active 15 minutes before until 2 hours after
  };

  const handleJoinClass = async (session: ClassSession) => {
    if (session.meeting_link) {
      // Record attendance when joining
      recordAttendanceMutation.mutate(session.id);
      // Open meeting link
      window.open(session.meeting_link, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Live Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Live Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingClasses && upcomingClasses.length > 0 ? (
          <div className="space-y-4">
            {upcomingClasses.map((session) => (
              <div key={session.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{session.topic || "Class Session"}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isSessionActive(session.start_time)
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {isSessionActive(session.start_time) ? "Active" : "Upcoming"}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {session.course_title}
                </p>
                
                <div className="flex items-center text-gray-500 text-xs mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(session.start_time)}</span>
                  <Clock className="w-4 h-4 ml-2 mr-1" />
                  <span>
                    {new Date(session.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(session.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                
                <Button
                  className="w-full"
                  disabled={!isSessionActive(session.start_time) || recordAttendanceMutation.isPending}
                  onClick={() => handleJoinClass(session)}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {recordAttendanceMutation.isPending 
                    ? "Joining..." 
                    : isSessionActive(session.start_time) 
                      ? "Join Class" 
                      : "Class Not Active Yet"
                  }
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No upcoming classes</h3>
            <p className="text-gray-500">There are no scheduled live sessions at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export both as default and named export
export { LiveClassSchedule };
export default LiveClassSchedule;
