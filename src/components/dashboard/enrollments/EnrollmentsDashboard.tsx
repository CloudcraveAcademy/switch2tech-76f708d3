
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EnrollmentsDashboard = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enrollments Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Enrollments management interface</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentsDashboard;
