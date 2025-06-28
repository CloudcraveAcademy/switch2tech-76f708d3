
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LessonsDashboard = () => {
  const { courseId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lessons Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lessons for Course: {courseId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lessons management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonsDashboard;
