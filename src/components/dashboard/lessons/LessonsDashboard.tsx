
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LessonsDashboard = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lessons Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lessons management interface</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonsDashboard;
