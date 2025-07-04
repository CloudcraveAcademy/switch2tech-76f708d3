
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LessonDetails = () => {
  const { lessonId } = useParams();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details for lesson: {lessonId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetails;
