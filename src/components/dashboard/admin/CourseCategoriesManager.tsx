
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CourseCategoriesManager = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Categories Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage course categories</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCategoriesManager;
