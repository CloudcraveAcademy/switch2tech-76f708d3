
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";

type NotificationType = "course" | "announcement" | "assignment" | "system";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  course_title?: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Mock query for notifications - would be replaced with actual Supabase query
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Placeholder - would be replaced with actual Supabase query
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Course Module Available",
          message: "The Advanced React Hooks module is now available in your React Mastery course.",
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          type: "course",
          read: false,
          link: "/dashboard/my-courses",
          course_title: "React Mastery"
        },
        {
          id: "2",
          title: "Assignment Due Tomorrow",
          message: "Don't forget to submit your TypeScript project by tomorrow at 11:59 PM.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          type: "assignment",
          read: false,
          link: "/dashboard/my-courses",
          course_title: "TypeScript Fundamentals"
        },
        {
          id: "3",
          title: "Live Session Scheduled",
          message: "A live Q&A session for your Cloud Computing course has been scheduled for Friday at 3:00 PM.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          type: "course",
          read: true,
          link: "/dashboard/my-courses",
          course_title: "Cloud Computing Advanced"
        },
        {
          id: "4",
          title: "New Platform Feature",
          message: "We've added a new feature to help you track your learning progress more effectively.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          type: "system",
          read: true,
          link: ""
        },
        {
          id: "5",
          title: "Course Completion Certificate",
          message: "Congratulations! Your certificate for JavaScript Basics is ready to download.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          type: "course",
          read: true,
          link: "/dashboard/certificates",
          course_title: "JavaScript Basics"
        }
      ];

      return mockNotifications;
    }
  });

  // Filter notifications based on active tab
  const filteredNotifications = notifications?.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === notification.type) return true;
    return false;
  });

  // Mark notification as read
  const markAsRead = async (id: string) => {
    // This would be replaced with an actual Supabase call
    console.log(`Marking notification ${id} as read`);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // This would be replaced with an actual Supabase call
    console.log("Marking all notifications as read");
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "course":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "announcement":
        return <Info className="h-5 w-5 text-purple-500" />;
      case "assignment":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2" /> Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-gray-600">Stay updated with your courses and platform announcements</p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="course">
            Courses
          </TabsTrigger>
          <TabsTrigger value="assignment">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="system">
            System
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              {filteredNotifications?.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {activeTab === "all" 
                      ? "You don't have any notifications yet." 
                      : activeTab === "unread" 
                        ? "You've read all your notifications." 
                        : `You don't have any ${activeTab} notifications.`}
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredNotifications?.map((notification) => (
                    <li key={notification.id} className={`p-4 ${!notification.read ? "bg-blue-50" : ""} hover:bg-gray-50`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          
                          {notification.course_title && (
                            <p className="mt-1 text-xs text-gray-500">
                              Course: {notification.course_title}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            {notification.link && (
                              <Button variant="link" className="px-0 h-auto" asChild>
                                <Link to={notification.link}>View details</Link>
                              </Button>
                            )}
                            
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
