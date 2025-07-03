
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CourseDetails = () => {
  const { courseId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Course Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course ID: {courseId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course details functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetails;
