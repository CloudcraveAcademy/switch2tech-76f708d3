
import { 
  BookOpen, 
  CheckCircle, 
  Calendar, 
  BarChart3
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface DashboardStatsProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    upcomingSessions: number;
    courseCompletionProgress: number;
    progressChange: number;
  };
}

export function DashboardStats({ stats = { 
  totalCourses: 0, 
  completedCourses: 0, 
  upcomingSessions: 0, 
  courseCompletionProgress: 0,
  progressChange: 0
} }: DashboardStatsProps) {
  const statsItems = [
    {
      title: "Enrolled Courses",
      value: stats.totalCourses,
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      description: "Total courses enrolled"
    },
    {
      title: "Completed Courses",
      value: stats.completedCourses,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: "Courses completed"
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      description: "Scheduled live classes"
    },
    {
      title: "Course Completion",
      value: `${stats.courseCompletionProgress}%`,
      icon: <BarChart3 className="h-5 w-5 text-amber-600" />,
      description: `${stats.progressChange >= 0 ? '+' : ''}${stats.progressChange}% progress`,
      progress: stats.courseCompletionProgress,
      progressChange: stats.progressChange
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsItems.map((item, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gray-100">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>
                <h3 className="text-2xl font-bold">
                  {item.value}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {item.description}
                </p>
                
                {item.progress !== undefined && (
                  <div className="mt-3 w-full">
                    <Progress value={item.progress} className="h-1" />
                    {item.progressChange !== undefined && (
                      <div className="flex items-center text-xs mt-1">
                        {item.progressChange >= 0 ? (
                          <span className="text-green-600 font-medium">+{item.progressChange}%</span>
                        ) : (
                          <span className="text-red-600 font-medium">{item.progressChange}%</span>
                        )}
                        <span className="text-gray-500 ml-1">this week</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
