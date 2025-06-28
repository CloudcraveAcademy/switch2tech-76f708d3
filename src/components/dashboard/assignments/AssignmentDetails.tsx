
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignmentDetails = () => {
  const { courseId, assignmentId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Assignment Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course: {courseId} - Assignment: {assignmentId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Assignment details will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
