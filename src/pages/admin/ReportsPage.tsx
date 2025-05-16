
import { useState } from "react";
import { FileText, Download, Users, BookOpen, CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const ReportsPage = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedReports, setSelectedReports] = useState({
    users: true,
    courses: true,
    transactions: true,
    activities: false,
  });

  const handleGenerateReport = () => {
    // Validate date range
    if (!startDate || !endDate) {
      toast({
        title: "Date range required",
        description: "Please select both start and end dates for your report.",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before or equal to end date.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate at least one report type is selected
    if (!Object.values(selectedReports).some(Boolean)) {
      toast({
        title: "No report selected",
        description: "Please select at least one report type to generate.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating report",
      description: "Your report is being generated and will download shortly.",
    });

    // In a real app, this would connect to a backend endpoint to generate the report
    setTimeout(() => {
      toast({
        title: "Report generated",
        description: "Your report has been successfully generated.",
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-gray-600">Generate and access platform reports</p>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Access platform analytics and reports</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium">User Reports</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">User registrations, activity, and retention analytics</p>
              <Button variant="outline" size="sm" onClick={() => toast({
                title: "Generating User Report",
                description: "Your user report will download shortly.",
              })}>View Report</Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center mr-3">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium">Course Reports</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Course popularity, engagement, and completion rates</p>
              <Button variant="outline" size="sm" onClick={() => toast({
                title: "Generating Course Report",
                description: "Your course report will download shortly.",
              })}>View Report</Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center mr-3">
                  <CircleDollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-medium">Financial Reports</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Revenue, transactions, and payout analytics</p>
              <Button variant="outline" size="sm" onClick={() => toast({
                title: "Generating Financial Report",
                description: "Your financial report will download shortly.",
              })}>View Report</Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="font-medium">System Reports</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Platform performance, errors, and usage statistics</p>
              <Button variant="outline" size="sm" onClick={() => toast({
                title: "Generating System Report",
                description: "Your system report will download shortly.",
              })}>View Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
          <CardDescription>Create custom reports for specific time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Export Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="users-export" 
                    checked={selectedReports.users}
                    onCheckedChange={(checked) => 
                      setSelectedReports({...selectedReports, users: checked === true})
                    }
                  />
                  <label 
                    htmlFor="users-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    User Data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="courses-export" 
                    checked={selectedReports.courses}
                    onCheckedChange={(checked) => 
                      setSelectedReports({...selectedReports, courses: checked === true})
                    }
                  />
                  <label 
                    htmlFor="courses-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Course Data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="transactions-export" 
                    checked={selectedReports.transactions}
                    onCheckedChange={(checked) => 
                      setSelectedReports({...selectedReports, transactions: checked === true})
                    }
                  />
                  <label 
                    htmlFor="transactions-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transaction Data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="activities-export" 
                    checked={selectedReports.activities}
                    onCheckedChange={(checked) => 
                      setSelectedReports({...selectedReports, activities: checked === true})
                    }
                  />
                  <label 
                    htmlFor="activities-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Activity Logs
                  </label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Date Range</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="start-date" className="text-sm">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="start-date"
                        >
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="end-date" className="text-sm">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="end-date"
                        >
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button className="w-full" onClick={handleGenerateReport}>
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
