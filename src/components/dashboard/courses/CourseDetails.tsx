
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CourseDetails = () => {
  const { courseId } = useParams();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details for course: {courseId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetails;
