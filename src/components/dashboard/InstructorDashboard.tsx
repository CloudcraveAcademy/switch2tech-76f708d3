
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Book, 
  CircleDollarSign, 
  Users 
} from "lucide-react";
import { Link } from "react-router-dom";

const InstructorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          Manage your courses and students
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Courses
                </p>
                <p className="text-3xl font-bold">8</p>
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
                  Total Students
                </p>
                <p className="text-3xl font-bold">437</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">₦720,500</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Rating
                </p>
                <p className="text-3xl font-bold">4.8</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Courses */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Courses</h2>
          <Link to="/dashboard/create-course">
            <Button>Create New Course</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Web Development Bootcamp</span>
                <Button variant="ghost" size="sm" className="text-brand-600">Edit</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students</span>
                  <span className="font-medium">152</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-medium">₦240,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Rating</span>
                  <span className="font-medium">4.9/5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Published</span>
                  <span className="font-medium">Yes</span>
                </div>
                <Link to="/dashboard/course/1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>React for Beginners</span>
                <Button variant="ghost" size="sm" className="text-brand-600">Edit</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-medium">₦145,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Rating</span>
                  <span className="font-medium">4.7/5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Published</span>
                  <span className="font-medium">Yes</span>
                </div>
                <Link to="/dashboard/course/2">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Student Activities */}
      <h2 className="text-xl font-bold mb-4">Recent Student Activities</h2>
      <Card className="mb-10">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=student1" 
                alt="Student" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center">
                <p className="font-medium">John Doe</p>
                <span className="text-xs text-gray-500 ml-2">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-700">Completed Lesson 5: "Advanced CSS Techniques"</p>
              <p className="text-xs text-gray-500 mt-1">Web Development Bootcamp</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=student2" 
                alt="Student" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center">
                <p className="font-medium">Sarah Johnson</p>
                <span className="text-xs text-gray-500 ml-2">5 hours ago</span>
              </div>
              <p className="text-sm text-gray-700">Submitted assignment: "Building a React Component"</p>
              <p className="text-xs text-gray-500 mt-1">React for Beginners</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=student3" 
                alt="Student" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center">
                <p className="font-medium">Michael Adegoke</p>
                <span className="text-xs text-gray-500 ml-2">1 day ago</span>
              </div>
              <p className="text-sm text-gray-700">Left a 5-star review</p>
              <p className="text-xs text-gray-500 mt-1">Web Development Bootcamp</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <h2 className="text-xl font-bold mb-4">Pending Tasks</h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Grade 5 assignments</p>
                <p className="text-sm text-gray-500">Web Development Bootcamp</p>
              </div>
              <Button size="sm">Grade Now</Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Answer 3 student questions</p>
                <p className="text-sm text-gray-500">React for Beginners</p>
              </div>
              <Button size="sm">View Questions</Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Schedule live session</p>
                <p className="text-sm text-gray-500">Web Development Bootcamp</p>
              </div>
              <Button size="sm">Schedule</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
