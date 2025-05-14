
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Star, Clock, BookOpen } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    enrolledCourses: number;
    completedCourses: number;
    hoursLearned: number;
    certificates: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  // Stats for dashboard summary
  const statsItems = [
    {
      title: "Enrolled Courses",
      value: stats.enrolledCourses,
      icon: <Book className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Courses",
      value: stats.completedCourses,
      icon: <Star className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Hours Learned",
      value: stats.hoursLearned,
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
    },
    {
      title: "Certificates",
      value: stats.certificates,
      icon: <BookOpen className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
