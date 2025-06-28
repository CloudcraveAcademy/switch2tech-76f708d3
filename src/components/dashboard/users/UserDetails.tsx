
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserDetails = () => {
  const { userId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>User ID: {userId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User details will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
