
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EnrollmentsDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Enrollments Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Enrollment management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentsDashboard;
