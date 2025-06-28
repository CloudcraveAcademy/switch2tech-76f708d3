
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LessonDetails = () => {
  const { courseId, lessonId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lesson Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course: {courseId} - Lesson: {lessonId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lesson details will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetails;
