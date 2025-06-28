
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignmentsDashboard = () => {
  const { courseId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Assignments Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Assignments for Course: {courseId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Assignments management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsDashboard;
