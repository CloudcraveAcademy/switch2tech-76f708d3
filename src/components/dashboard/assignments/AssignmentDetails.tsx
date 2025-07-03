
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignmentDetails = () => {
  const { courseId, assignmentId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assignment Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course: {courseId} | Assignment: {assignmentId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Assignment details functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
