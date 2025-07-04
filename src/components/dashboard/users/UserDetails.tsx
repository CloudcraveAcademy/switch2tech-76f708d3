
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserDetails = () => {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details for user: {userId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
