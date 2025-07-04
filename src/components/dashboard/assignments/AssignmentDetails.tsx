
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignmentDetails = () => {
  const { assignmentId } = useParams();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details for assignment: {assignmentId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
