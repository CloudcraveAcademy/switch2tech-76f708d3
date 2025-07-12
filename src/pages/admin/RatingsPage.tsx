import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import RatingsManager from "@/components/dashboard/admin/RatingsManager";

const RatingsPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user || !['admin', 'super_admin'].includes(user.role || 'student')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ratings Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage course ratings across the platform
          </p>
        </div>
        
        <RatingsManager />
      </div>
    </Layout>
  );
};

export default RatingsPage;