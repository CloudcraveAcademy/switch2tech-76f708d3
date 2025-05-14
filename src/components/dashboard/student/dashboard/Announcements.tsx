
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface AnnouncementType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  course_id: string | null;
}

export function Announcements() {
  const { user } = useAuth();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  // First get enrolled course ids
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
  
  // Then fetch announcements for those courses
  const { data: announcements, isLoading } = useQuery<AnnouncementType[]>({
    queryKey: ['announcements', enrolledCourseIds],
    queryFn: async () => {
      if (!enrolledCourseIds.length) return [];
      
      try {
        // Try with RPC first
        const { data, error } = await supabase.rpc('get_announcements_for_courses', {
          course_ids: enrolledCourseIds
        });
        
        if (error) {
          // Fall back to direct query
          console.warn("Falling back to direct query for announcements", error);
          const { data: directData, error: directError } = await supabase
            .from('course_announcements')
            .select('*')
            .in('course_id', enrolledCourseIds)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (directError) throw directError;
          return directData || [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
      }
    },
    enabled: enrolledCourseIds.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {announcements && announcements.length > 0 ? (
          <ul className="space-y-4">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="border-b pb-3 last:border-0">
                <h3 className="font-medium">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.created_at)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No announcements at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
