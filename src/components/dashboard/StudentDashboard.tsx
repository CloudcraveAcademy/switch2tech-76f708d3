
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Book, Calendar, Clock, Star } from "lucide-react";
import { mockCourses } from "@/utils/mockData";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching enrolled courses
    const mockEnrolled = mockCourses.slice(0, 4).map((course) => ({
      ...course,
      progress: Math.floor(Math.random() * 100),
      nextLesson: {
        title: "Understanding Core Concepts",
        duration: "15 minutes",
        date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }));
    setEnrolledCourses(mockEnrolled);
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Enrolled Courses
                </p>
                <p className="text-3xl font-bold">{enrolledCourses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Courses
                </p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Hours Learned
                </p>
                <p className="text-3xl font-bold">48</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      <h2 className="text-xl font-bold mb-4">In Progress Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-40">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <Badge className={`${
                  course.level === "beginner"
                    ? "bg-green-100 text-green-800"
                    : course.level === "intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {course.level}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <span>{course.instructor.name}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
              <div className="border-t pt-3 mt-2">
                <p className="text-sm font-medium mb-1">Next Lesson:</p>
                <p className="text-sm text-gray-700">{course.nextLesson.title}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.nextLesson.duration}
                  </span>
                  <Link to={`/courses/${course.id}`}>
                    <Button size="sm">Continue</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Upcoming Classes */}
      <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
      <Card className="mb-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Course</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolledCourses.slice(0, 3).map((course, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-gray-500">
                            {course.instructor.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${
                        course.mode === "live"
                          ? "bg-pink-100 text-pink-800"
                          : course.mode === "virtual"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {course.mode.charAt(0).toUpperCase() + course.mode.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">
                          {formatDate(course.nextLesson.date)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Join Class
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Announcements */}
      <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold">New Course Launching: Cloud Computing Advanced</h3>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              We're excited to announce a new advanced course on Cloud Computing launching next week. 
              Early bird registration with 20% discount is now open!
            </p>
            <Button variant="link" className="text-sm p-0 h-auto">Read more</Button>
          </div>
          
          <div className="border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold">System Maintenance: Platform Downtime</h3>
              <span className="text-xs text-gray-500">1 week ago</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              We'll be performing system maintenance this weekend. The platform will be unavailable 
              on Saturday from 2 AM to 5 AM (WAT).
            </p>
            <Button variant="link" className="text-sm p-0 h-auto">Read more</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
