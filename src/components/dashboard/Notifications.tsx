
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  CreditCard,
  Award,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  user_id: string;
  type: "course" | "assignment" | "message" | "system" | "announcement" | "certificate" | "payment" | "enrollment";
  title: string;
  description: string;
  read: boolean;
  action_url?: string;
  course_id?: string;
  instructor_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
    image_url?: string;
  };
  instructor?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch notifications from Supabase with real-time updates
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          course:courses(title, image_url),
          instructor:user_profiles!instructor_id(first_name, last_name, avatar_url)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      return data as Notification[];
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      toast({
        description: "Notification marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      toast({
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get counts for each tab
  const getTabCount = (type: string) => {
    if (type === "all") return notifications.length;
    if (type === "unread") return unreadCount;
    return notifications.filter(n => n.type === type).length;
  };

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
      case "certificate":
        return <Award className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      case "enrollment":
        return <UserPlus className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Helper function to get notification type color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "course":
        return "text-blue-600 bg-blue-100";
      case "assignment":
        return "text-orange-600 bg-orange-100";
      case "message":
        return "text-green-600 bg-green-100";
      case "system":
        return "text-gray-600 bg-gray-100";
      case "announcement":
        return "text-purple-600 bg-purple-100";
      case "certificate":
        return "text-yellow-600 bg-yellow-100";
      case "payment":
        return "text-emerald-600 bg-emerald-100";
      case "enrollment":
        return "text-indigo-600 bg-indigo-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Helper function to get correct link for notification type
  const getNotificationLink = (notification: Notification) => {
    if (notification.action_url) return notification.action_url;
    
    // Generate appropriate links based on notification type
    switch (notification.type) {
      case "course":
      case "enrollment":
        return notification.course_id ? `/dashboard/courses/${notification.course_id}` : "/dashboard/my-courses";
      case "assignment":
        return "/dashboard/assignments";
      case "announcement":
        return notification.course_id ? `/dashboard/courses/${notification.course_id}` : "/dashboard";
      case "certificate":
        return "/dashboard/certificates";
      case "payment":
        return "/dashboard/payouts";
      case "message":
        return "/dashboard/messages";
      default:
        return "/dashboard";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-red-700">Error loading notifications</h3>
          <p className="text-red-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

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
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Marking...
              </>
            ) : (
              "Mark all as read"
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" className="relative">
            All
            {getTabCount("all") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("all")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {getTabCount("unread") > 0 && (
              <Badge className="ml-1 h-5 min-w-5 text-xs bg-red-500 text-white">
                {getTabCount("unread")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="course">
            Courses
            {getTabCount("course") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("course")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assignment">
            Tasks
            {getTabCount("assignment") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("assignment")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcement">
            News
            {getTabCount("announcement") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("announcement")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="certificate">
            Certs
            {getTabCount("certificate") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("certificate")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payment">
            Money
            {getTabCount("payment") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {getTabCount("payment")}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Single Tab Content - shows filtered notifications based on active tab */}
        <TabsContent value={activeTab}>
          <NotificationsList 
            notifications={filteredNotifications}
            markAsRead={markAsRead}
            markAsReadMutation={markAsReadMutation}
            getNotificationIcon={getNotificationIcon}
            getNotificationColor={getNotificationColor}
            getNotificationLink={getNotificationLink}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate component for the notifications list to avoid duplication
interface NotificationsListProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAsReadMutation: any;
  getNotificationIcon: (type: string) => JSX.Element;
  getNotificationColor: (type: string) => string;
  getNotificationLink: (notification: Notification) => string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  markAsRead,
  markAsReadMutation,
  getNotificationIcon,
  getNotificationColor,
  getNotificationLink,
}) => {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`p-4 ${!notification.read ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
            >
              <div className="flex">
                <div className={`flex-shrink-0 mr-4 p-2 rounded-full ${
                  !notification.read 
                    ? getNotificationColor(notification.type)
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between">
                    <h4 className={`font-medium ${!notification.read ? 'text-blue-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  
                  {notification.course?.title && (
                    <div className="mt-2 flex items-center">
                      <BookOpen className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{notification.course.title}</span>
                    </div>
                  )}
                  
                  {notification.instructor && (
                    <div className="mt-2 flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage src={notification.instructor.avatar_url} />
                        <AvatarFallback>
                          {notification.instructor.first_name?.[0]}{notification.instructor.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {notification.instructor.first_name} {notification.instructor.last_name}
                      </span>
                    </div>
                  )}

                  {notification.metadata && notification.metadata.amount && (
                    <div className="mt-2 flex items-center">
                      <CreditCard className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">
                        {notification.metadata.currency} {notification.metadata.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2">
                    {notification.action_url && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={getNotificationLink(notification)}>View Details</Link>
                      </Button>
                    )}
                    
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        {markAsReadMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Mark as Read"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Notifications;
