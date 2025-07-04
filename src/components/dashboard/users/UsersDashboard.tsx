
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UsersDashboard = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Users Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Users management interface</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;
