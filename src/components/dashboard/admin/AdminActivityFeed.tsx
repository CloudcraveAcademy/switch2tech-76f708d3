
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CreditCard, Download, UserPlus, UserX, AlertCircle, CheckCircle, FileText } from "lucide-react";

interface AdminActivityFeedProps {
  limit?: number;
}

const AdminActivityFeed = ({ limit }: AdminActivityFeedProps) => {
  // Mock activity data - in a real app, this would come from the backend
  const activityData = [
    {
      id: 1,
      type: "course-created",
      title: "New Course Created",
      detail: "Advanced React Patterns",
      user: {
        name: "John Smith",
        role: "Instructor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor1"
      },
      time: "Today, 10:30 AM",
      status: "pending-review",
      statusText: "Pending Review"
    },
    {
      id: 2,
      type: "user-registration",
      title: "New User Registration",
      detail: "Student account created",
      user: {
        name: "Amina Mohammed",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student42"
      },
      time: "Today, 9:15 AM",
      status: "completed",
      statusText: "Completed"
    },
    {
      id: 3,
      type: "payment",
      title: "New Payment Received",
      detail: "₦45,000 - DevOps for Beginners",
      user: {
        name: "David Okonkwo",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student24"
      },
      time: "Yesterday, 2:45 PM",
      status: "successful",
      statusText: "Successful"
    },
    {
      id: 4,
      type: "course-update",
      title: "Course Update",
      detail: "Web Security Fundamentals - Added new module",
      user: {
        name: "Sarah Johnson",
        role: "Instructor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor8"
      },
      time: "Yesterday, 11:20 AM",
      status: "published",
      statusText: "Published"
    },
    {
      id: 5,
      type: "enrollment",
      title: "New Course Enrollment",
      detail: "Fundamentals of UX Design",
      user: {
        name: "Michael Chen",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student18"
      },
      time: "Yesterday, 10:05 AM",
      status: "completed",
      statusText: "Completed"
    },
    {
      id: 6,
      type: "certificate",
      title: "Certificate Issued",
      detail: "Python for Data Science",
      user: {
        name: "Emma Okafor",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student33"
      },
      time: "May 15, 3:30 PM",
      status: "issued",
      statusText: "Issued"
    },
    {
      id: 7,
      type: "user-deleted",
      title: "User Account Deleted",
      detail: "User requested account deletion",
      user: {
        name: "Robert James",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student99"
      },
      time: "May 15, 11:45 AM",
      status: "deleted",
      statusText: "Deleted"
    },
    {
      id: 8,
      type: "support-ticket",
      title: "Support Ticket Opened",
      detail: "Payment issue with course checkout",
      user: {
        name: "Jennifer Adams",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student55"
      },
      time: "May 14, 4:15 PM",
      status: "open",
      statusText: "Open"
    },
    {
      id: 9,
      type: "support-ticket",
      title: "Support Ticket Resolved",
      detail: "Video playback issue resolved",
      user: {
        name: "Chidi Obi",
        role: "Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student66"
      },
      time: "May 14, 2:30 PM",
      status: "resolved",
      statusText: "Resolved"
    },
    {
      id: 10,
      type: "payout",
      title: "Instructor Payout Processed",
      detail: "₦280,000 for April earnings",
      user: {
        name: "Daniel Adeyemi",
        role: "Instructor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor5"
      },
      time: "May 13, 10:00 AM",
      status: "completed",
      statusText: "Completed"
    }
  ];

  // Limit the number of activities to show if specified
  const activitiesToShow = limit ? activityData.slice(0, limit) : activityData;

  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course-created":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "user-registration":
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      case "course-update":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "enrollment":
        return <BookOpen className="h-5 w-5 text-green-600" />;
      case "certificate":
        return <Download className="h-5 w-5 text-yellow-600" />;
      case "user-deleted":
        return <UserX className="h-5 w-5 text-red-600" />;
      case "support-ticket":
        return type.includes("resolved") ? 
          <CheckCircle className="h-5 w-5 text-green-600" /> : 
          <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "payout":
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // Function to get the appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending-review":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
      case "successful":
      case "published":
      case "issued":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      case "open":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full">
      <div className="divide-y">
        {activitiesToShow.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50">
            <div className="mt-0.5 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.detail}
                  </p>
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${getStatusColor(activity.status)}`}
                >
                  {activity.statusText}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="h-6 w-6 rounded-full"
                />
                <div>
                  <p className="text-xs font-medium">{activity.user.name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">{activity.user.role}</p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminActivityFeed;
