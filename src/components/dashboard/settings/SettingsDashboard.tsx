
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsDashboard = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings management interface</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDashboard;
