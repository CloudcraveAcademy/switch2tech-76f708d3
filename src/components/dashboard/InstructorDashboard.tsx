
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Book, Users, DollarSign, PlusCircle, BarChart3, Calendar } from "lucide-react";

const InstructorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0] || "Instructor"}!
        </h1>
        <p className="text-gray-600">
          Manage your courses and track student progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold">12</p>
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
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-3xl font-bold">248</p>
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
                <p className="text-sm font-medium text-gray-500">This Month Revenue</p>
                <p className="text-3xl font-bold">₦485,000</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Course Rating</p>
                <p className="text-3xl font-bold">4.8</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Start building your next course and share your expertise with students.</p>
            <Button asChild className="w-full">
              <Link to="/dashboard/create-course">Create Course</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Manage Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Edit your existing courses, update content, and track performance.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/my-courses">View Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your students, track their progress, and provide support.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/students">View Students</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Course Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Python for Beginners</p>
                  <p className="text-sm text-gray-500">5 new enrollments today</p>
                </div>
                <span className="text-green-600 font-semibold">+5</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Web Development Bootcamp</p>
                  <p className="text-sm text-gray-500">3 assignments submitted</p>
                </div>
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Science Fundamentals</p>
                  <p className="text-sm text-gray-500">New course review (5 stars)</p>
                </div>
                <span className="text-yellow-600 font-semibold">★★★★★</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Python Fundamentals - Live Session</p>
                <p className="text-sm text-gray-500">Today at 2:00 PM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium">Web Dev Q&A Session</p>
                <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-medium">Data Science Workshop</p>
                <p className="text-sm text-gray-500">Friday at 3:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
