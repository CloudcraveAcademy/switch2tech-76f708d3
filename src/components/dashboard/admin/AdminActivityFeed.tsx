
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CreditCard, Download, UserPlus, UserX, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AdminActivityFeedProps {
  limit?: number;
}

const AdminActivityFeed = ({ limit }: AdminActivityFeedProps) => {
  // Fetch real activity data from multiple sources
  const { data: activityData = [], isLoading } = useQuery({
    queryKey: ['admin-activity-feed', limit],
    queryFn: async () => {
      const activities: any[] = [];

      // Fetch recent enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrollment_date,
          student_id,
          course_id,
          courses (title),
          user_profiles!enrollments_student_id_fkey (first_name, last_name, avatar_url)
        `)
        .order('enrollment_date', { ascending: false })
        .limit(5);

      if (enrollments) {
        enrollments.forEach((enrollment: any) => {
          activities.push({
            id: `enrollment-${enrollment.id}`,
            type: "enrollment",
            title: "New Course Enrollment",
            detail: enrollment.courses?.title || "Course",
            user: {
              name: enrollment.user_profiles ? 
                `${enrollment.user_profiles.first_name || ''} ${enrollment.user_profiles.last_name || ''}`.trim() || 'Unknown Student' : 
                'Unknown Student',
              role: "Student",
              avatar: enrollment.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student_id}`
            },
            time: formatDistanceToNow(new Date(enrollment.enrollment_date), { addSuffix: true }),
            status: "completed",
            statusText: "Completed",
            timestamp: new Date(enrollment.enrollment_date).getTime()
          });
        });
      }

      // Fetch recent certificates
      const { data: certificates } = await supabase
        .from('certificates')
        .select(`
          id,
          issue_date,
          student_id,
          course_id,
          courses (title),
          user_profiles!certificates_student_id_fkey (first_name, last_name, avatar_url)
        `)
        .order('issue_date', { ascending: false })
        .limit(5);

      if (certificates) {
        certificates.forEach((cert: any) => {
          activities.push({
            id: `certificate-${cert.id}`,
            type: "certificate",
            title: "Certificate Issued",
            detail: cert.courses?.title || "Course",
            user: {
              name: cert.user_profiles ? 
                `${cert.user_profiles.first_name || ''} ${cert.user_profiles.last_name || ''}`.trim() || 'Unknown Student' : 
                'Unknown Student',
              role: "Student",
              avatar: cert.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cert.student_id}`
            },
            time: formatDistanceToNow(new Date(cert.issue_date), { addSuffix: true }),
            status: "issued",
            statusText: "Issued",
            timestamp: new Date(cert.issue_date).getTime()
          });
        });
      }

      // Fetch recent courses
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          id,
          created_at,
          title,
          is_published,
          instructor_id,
          user_profiles!courses_instructor_id_fkey (first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (courses) {
        courses.forEach((course: any) => {
          activities.push({
            id: `course-${course.id}`,
            type: "course-created",
            title: "New Course Created",
            detail: course.title,
            user: {
              name: course.user_profiles ? 
                `${course.user_profiles.first_name || ''} ${course.user_profiles.last_name || ''}`.trim() || 'Unknown Instructor' : 
                'Unknown Instructor',
              role: "Instructor",
              avatar: course.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor_id}`
            },
            time: formatDistanceToNow(new Date(course.created_at), { addSuffix: true }),
            status: course.is_published ? "published" : "pending-review",
            statusText: course.is_published ? "Published" : "Pending Review",
            timestamp: new Date(course.created_at).getTime()
          });
        });
      }

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          created_at,
          amount,
          currency,
          status,
          user_id,
          course_id,
          courses (title),
          user_profiles!payment_transactions_user_id_fkey (first_name, last_name, avatar_url)
        `)
        .eq('status', 'successful')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactions) {
        transactions.forEach((transaction: any) => {
          const currencySymbol = transaction.currency === 'NGN' ? '₦' : transaction.currency === 'USD' ? '$' : '€';
          activities.push({
            id: `payment-${transaction.id}`,
            type: "payment",
            title: "New Payment Received",
            detail: `${currencySymbol}${transaction.amount?.toLocaleString()} - ${transaction.courses?.title || 'Course'}`,
            user: {
              name: transaction.user_profiles ? 
                `${transaction.user_profiles.first_name || ''} ${transaction.user_profiles.last_name || ''}`.trim() || 'Unknown Student' : 
                'Unknown Student',
              role: "Student",
              avatar: transaction.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${transaction.user_id}`
            },
            time: formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true }),
            status: "successful",
            statusText: "Successful",
            timestamp: new Date(transaction.created_at).getTime()
          });
        });
      }

      // Fetch recent user registrations
      const { data: newUsers } = await supabase
        .from('user_profiles')
        .select('id, created_at, first_name, last_name, role, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5);

      if (newUsers) {
        newUsers.forEach((user: any) => {
          activities.push({
            id: `user-${user.id}`,
            type: "user-registration",
            title: "New User Registration",
            detail: `${user.role || 'Student'} account created`,
            user: {
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'New User',
              role: user.role || 'Student',
              avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
            },
            time: formatDistanceToNow(new Date(user.created_at), { addSuffix: true }),
            status: "completed",
            statusText: "Completed",
            timestamp: new Date(user.created_at).getTime()
          });
        });
      }

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp - a.timestamp);

      // Return limited or full list
      return limit ? activities.slice(0, limit) : activities;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="space-y-4">
          {[...Array(limit || 5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activitiesToShow = activityData;

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
