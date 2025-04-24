
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  File,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: "course" | "assignment" | "message" | "system" | "announcement";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  course_id?: string;
  course_title?: string;
  instructor_name?: string;
  instructor_avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "course",
    title: "New lesson available",
    description: "Lesson 3: Advanced React Patterns is now available for viewing",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    action_url: "/courses/123/lessons/3",
    course_id: "123",
    course_title: "React Masterclass",
    instructor_name: "Jane Smith",
    instructor_avatar: "/placeholder.svg"
  },
  {
    id: "2",
    type: "assignment",
    title: "Assignment due soon",
    description: "Your assignment 'Build a Calculator' is due in 2 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: false,
    action_url: "/courses/123/assignments/2",
    course_id: "123",
    course_title: "React Masterclass",
  },
  {
    id: "3",
    type: "message",
    title: "New message from instructor",
    description: "Jane Smith left a comment on your assignment submission",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    action_url: "/courses/123/assignments/2/feedback",
    instructor_name: "Jane Smith",
    instructor_avatar: "/placeholder.svg"
  },
  {
    id: "4",
    type: "system",
    title: "Account verified",
    description: "Your account email has been successfully verified",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    read: true
  },
  {
    id: "5",
    type: "announcement",
    title: "New course launching soon",
    description: "We're excited to announce our new 'Advanced DevOps' course launching next week",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true
  },
  {
    id: "6",
    type: "course",
    title: "Live class reminder",
    description: "Your scheduled live class for 'Cybersecurity Fundamentals' starts in 3 hours",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    action_url: "/courses/456/live-classes/3",
    course_id: "456",
    course_title: "Cybersecurity Fundamentals",
  }
];

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // In a real app, we'd fetch notifications from Supabase
  // const { data: notifications, isLoading } = useQuery({
  //   queryKey: ["notifications", user?.id],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from("notifications")
  //       .select("*")
  //       .eq("user_id", user?.id)
  //       .order("timestamp", { ascending: false });

  //     if (error) throw error;
  //     return data as Notification[];
  //   },
  //   enabled: !!user?.id,
  // });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // In a real app, we'd update Supabase
    // const updateNotification = async () => {
    //   await supabase
    //     .from("notifications")
    //     .update({ read: true })
    //     .eq("id", id);
    // };
    // updateNotification();
    
    toast({
      description: "Notification marked as read",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // In a real app, we'd update Supabase
    // const updateAllNotifications = async () => {
    //   await supabase
    //     .from("notifications")
    //     .update({ read: true })
    //     .eq("user_id", user?.id)
    //     .eq("read", false);
    // };
    // updateAllNotifications();
    
    toast({
      description: "All notifications marked as read",
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper function to get the icon for the notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-5 w-5" />;
      case "assignment":
        return <File className="h-5 w-5" />;
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "system":
        return <CheckCircle className="h-5 w-5" />;
      case "announcement":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2" /> Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{unreadCount} New</Badge>
            )}
          </h1>
          <p className="text-gray-600">Stay updated with your course activities</p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && <Badge className="ml-1 bg-red-100 text-red-800">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="assignment">Assignments</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y">
                {filteredNotifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`p-4 ${!notification.read ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex">
                      <div className={`flex-shrink-0 mr-4 p-2 rounded-full ${
                        !notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between">
                          <h4 className={`font-medium ${!notification.read ? 'text-blue-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        
                        {notification.course_title && (
                          <div className="mt-2 flex items-center">
                            <BookOpen className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">{notification.course_title}</span>
                          </div>
                        )}
                        
                        {notification.instructor_name && (
                          <div className="mt-2 flex items-center">
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarImage src={notification.instructor_avatar} />
                              <AvatarFallback>{notification.instructor_name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{notification.instructor_name}</span>
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center gap-2">
                          {notification.action_url && (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={notification.action_url}>View Details</Link>
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
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
      </Tabs>
    </div>
  );
};

export default Notifications;
