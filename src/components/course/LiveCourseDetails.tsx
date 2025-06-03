
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";

interface LiveCourseDetailsProps {
  courseStartDate?: string;
  registrationDeadline?: string;
  timezone?: string;
  classDays?: string[];
  classTime?: string;
  replayAccess?: boolean;
}

const LiveCourseDetails: React.FC<LiveCourseDetailsProps> = ({
  courseStartDate,
  registrationDeadline,
  timezone,
  classDays,
  classTime,
  replayAccess
}) => {
  // Parse class times
  let parsedClassTimes: Record<string, { startTime: string; endTime: string }> = {};
  if (classTime) {
    try {
      parsedClassTimes = JSON.parse(classTime);
    } catch (e) {
      console.error("Error parsing class times:", e);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Live Course Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseStartDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Course Start Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(courseStartDate), "PPP")}
                </p>
              </div>
            </div>
          )}
          
          {registrationDeadline && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Registration Deadline</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(registrationDeadline), "PPP")}
                </p>
              </div>
            </div>
          )}
          
          {timezone && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Timezone</p>
                <p className="text-sm text-gray-600">{timezone}</p>
              </div>
            </div>
          )}
          
          {replayAccess && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Replay Access</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>
          )}
        </div>

        {/* Class Schedule */}
        {classDays && classDays.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Class Schedule</p>
            <div className="space-y-2">
              {classDays.map((day) => (
                <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{day}</span>
                  {parsedClassTimes[day] && (
                    <span className="text-sm text-gray-600">
                      {parsedClassTimes[day].startTime} - {parsedClassTimes[day].endTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveCourseDetails;
