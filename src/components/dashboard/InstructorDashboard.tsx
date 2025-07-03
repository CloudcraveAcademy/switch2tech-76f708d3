
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Bell, PlusCircle, BarChart3, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstructorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Active Courses",
      value: "3",
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      change: "+2 this month"
    },
    {
      title: "Total Students",
      value: "127",
      icon: <Users className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
      change: "+12 this week"
    },
    {
      title: "Monthly Revenue",
      value: "$2,450",
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      change: "+15% from last month"
    },
    {
      title: "Course Rating",
      value: "4.8",
      icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
      change: "0.2 points up"
    },
  ];

  const recentActivities = [
    {
      icon: "bg-blue-500",
      title: "New student enrolled in React Fundamentals",
      time: "2 hours ago",
      student: "Sarah Johnson"
    },
    {
      icon: "bg-green-500",
      title: "Course \"Advanced JavaScript\" published",
      time: "1 day ago",
      action: "Published"
    },
    {
      icon: "bg-purple-500",
      title: "Received 5-star review from Mike Chen",
      time: "2 days ago",
      rating: "★★★★★"
    },
    {
      icon: "bg-orange-500",
      title: "Assignment submitted in Python Basics",
      time: "3 days ago",
      student: "Emma Davis"
    }
  ];

  const upcomingClasses = [
    {
      title: "React Fundamentals",
      time: "Today, 2:00 PM",
      students: 15,
      duration: "2 hours"
    },
    {
      title: "Advanced JavaScript",
      time: "Tomorrow, 10:00 AM",
      students: 8,
      duration: "1.5 hours"
    },
    {
      title: "Python for Beginners",
      time: "Friday, 3:00 PM",
      students: 22,
      duration: "2 hours"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "Instructor"}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your courses today
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 ${activity.icon} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.student && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {activity.student}
                        </span>
                      )}
                      {activity.rating && (
                        <span className="text-xs text-yellow-600">{activity.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              <Button className="w-full justify-start" variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Issue Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Upcoming Live Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingClasses.map((classItem, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{classItem.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {classItem.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {classItem.students} students enrolled
                  </p>
                  <p className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Duration: {classItem.duration}
                  </p>
                </div>
                <Button className="w-full mt-3" size="sm">
                  Start Class
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
