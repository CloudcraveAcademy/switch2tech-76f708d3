
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

const Announcements = () => {
  const { user } = useAuth();

  // Fetch announcements from the database if available, otherwise use mock data
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', user?.id],
    queryFn: async () => {
      try {
        // Check if we have an announcements table
        const { data, error } = await supabase.from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          // Fall back to mock data
          return getMockAnnouncements();
        }

        return data.map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          date: announcement.created_at
        }));
      } catch (error) {
        console.error("Error fetching announcements:", error);
        return getMockAnnouncements();
      }
    }
  });

  // Mock announcements function
  const getMockAnnouncements = (): Announcement[] => {
    return [
      {
        id: '1',
        title: 'New Course Launching: Cloud Computing Advanced',
        content: 'We\'re excited to announce a new advanced course on Cloud Computing launching next week. Early bird registration with 20% discount is now open!',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: '2',
        title: 'System Maintenance: Platform Downtime',
        content: 'We\'ll be performing system maintenance this weekend. The platform will be unavailable on Saturday from 2 AM to 5 AM (WAT).',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      },
    ];
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
      <Card>
        <CardContent className="p-6 space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No recent announcements</h3>
              <p className="text-gray-500">Check back later for updates</p>
            </div>
          ) : (
            announcements.map((announcement, index) => (
              <div key={announcement.id} className={`${index < announcements.length - 1 ? 'border-b pb-4' : ''} last:pb-0`}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(announcement.date))} ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {announcement.content}
                </p>
                <Button variant="link" className="text-sm p-0 h-auto">Read more</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Announcements;
