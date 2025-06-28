
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CourseCategoriesManager = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Course Categories Manager</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Course Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course categories management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCategoriesManager;
