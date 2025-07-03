
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Users, BookOpen, DollarSign, TrendingUp, Settings, Shield } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: "1,247",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Courses",
      value: "45",
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Monthly Revenue",
      value: "$24,500",
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
    },
    {
      title: "Growth Rate",
      value: "+12%",
      icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your platform and monitor overall performance
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
        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Status</span>
                <span className="text-green-600 text-sm font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <span className="text-green-600 text-sm font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Usage</span>
                <span className="text-yellow-600 text-sm font-medium">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-blue-600 text-sm font-medium">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-gray-500">Add, edit, or remove users</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">Course Categories</p>
                <p className="text-sm text-gray-500">Organize course categories</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">Payment Gateways</p>
                <p className="text-sm text-gray-500">Configure payment settings</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">System Settings</p>
                <p className="text-sm text-gray-500">Configure platform settings</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
