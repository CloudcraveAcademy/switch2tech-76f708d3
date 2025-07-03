
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LessonDetails = () => {
  const { courseId, lessonId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lesson Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course: {courseId} | Lesson: {lessonId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lesson details functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetails;
