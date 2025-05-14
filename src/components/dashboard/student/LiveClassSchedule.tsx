
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import { CourseEnrollmentService } from "@/services/CourseEnrollmentService";

interface ClassSession {
  id: string;
  course_id: string;
  course_title: string;
  instructor_name: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  topic: string;
  image_url: string;
}

const LiveClassSchedule = () => {
  const { user } = useAuth();
  const [attendingClass, setAttendingClass] = useState<string | null>(null);

  const { data: classSessions, isLoading } = useQuery({
    queryKey: ["liveClassSessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Query enrolled courses with scheduled live sessions
      const { data, error } = await supabase
        .from("class_sessions")
        .select(`
          id,
          start_time,
          end_time,
          topic,
          meeting_link,
          course:courses (
            id,
            title,
            image_url,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .eq("status", "scheduled")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching class sessions:", error);
        return [];
      }

      return data.map((session) => ({
        id: session.id,
        course_id: session.course.id,
        course_title: session.course.title,
        instructor_name: `${session.course.instructor.first_name || ""} ${
          session.course.instructor.last_name || ""
        }`.trim(),
        start_time: session.start_time,
        end_time: session.end_time,
        meeting_link: session.meeting_link || "https://meet.google.com/",
        topic: session.topic,
        image_url: session.course.image_url,
      }));
    },
    enabled: !!user?.id,
  });

  const handleJoinClass = async (session: ClassSession) => {
    setAttendingClass(session.id);
    try {
      // Record attendance
      await CourseEnrollmentService.recordClassAttendance(
        user!.id,
        session.course_id,
        session.id
      );
      
      // Open the meeting link in a new tab
      window.open(session.meeting_link, "_blank");
    } finally {
      setAttendingClass(null);
    }
  };

  // Check if a session is within 15 minutes of starting
  const isSessionActive = (startTime: string) => {
    const sessionStart = new Date(startTime);
    const now = new Date();
    const diffMinutes = (sessionStart.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 15 && diffMinutes >= -60; // Active 15 minutes before until 60 minutes after start
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Live Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 last:mb-0">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upcoming Live Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {classSessions?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No upcoming classes</h3>
            <p className="text-gray-500">You don't have any scheduled live classes</p>
          </div>
        ) : (
          <div className="divide-y">
            {classSessions?.map((session) => (
              <div key={session.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center flex-1 gap-3">
                  <img
                    src={session.image_url || "/placeholder.svg"}
                    alt={session.course_title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium line-clamp-1">{session.course_title}</h4>
                    <p className="text-sm text-gray-700">{session.topic}</p>
                    <p className="text-xs text-gray-500">{session.instructor_name}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(session.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDistanceToNow(new Date(session.start_time))}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={!isSessionActive(session.start_time) || attendingClass === session.id}
                    onClick={() => handleJoinClass(session)}
                    variant={isSessionActive(session.start_time) ? "default" : "outline"}
                    className="md:w-auto whitespace-nowrap"
                  >
                    {attendingClass === session.id ? "Joining..." : "Join Class"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveClassSchedule;
