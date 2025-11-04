import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminActivityFeed from "@/components/dashboard/admin/AdminActivityFeed";
import { Download, Filter } from "lucide-react";
import { useState } from "react";

const ActivityPage = () => {
  const [filterType, setFilterType] = useState<string>("all");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Activity</h1>
          <p className="text-muted-foreground">
            Monitor all platform activities and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="enrollment">Enrollments</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="certificate">Certificates</SelectItem>
              <SelectItem value="course-created">Courses</SelectItem>
              <SelectItem value="user-registration">User Registrations</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            All platform activities across users, courses, and transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AdminActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityPage;
