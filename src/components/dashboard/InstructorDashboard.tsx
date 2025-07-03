
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Bell } from "lucide-react";

const InstructorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Active Courses",
      value: "3",
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Students",
      value: "127",
      icon: <Users className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Monthly Revenue",
      value: "$2,450",
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
    },
    {
      title: "Course Rating",
      value: "4.8",
      icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0] || "Instructor"}!
        </h1>
        <p className="text-gray-600">
          Manage your courses and track your teaching progress
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New student enrolled in React Fundamentals</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Course "Advanced JavaScript" published</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Received 5-star review from Sarah</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">Create New Course</p>
                <p className="text-sm text-gray-500">Start building your next course</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">View Student Progress</p>
                <p className="text-sm text-gray-500">Check how your students are doing</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">Schedule Live Session</p>
                <p className="text-sm text-gray-500">Plan your next live class</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
