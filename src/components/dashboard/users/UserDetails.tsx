
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserDetails = () => {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>User ID: {userId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User details functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
