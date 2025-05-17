
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const ACCESS_DURATION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days (6 months)" },
  { value: "365", label: "365 days (1 year)" },
  { value: "lifetime", label: "Lifetime" },
];

const TIMEZONE_OPTIONS = [
  "WAT - West Africa Time",
  "GMT - Greenwich Mean Time",
  "EST - Eastern Standard Time",
  "PST - Pacific Standard Time",
  "CET - Central European Time",
];

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface CourseModeProps {
  form: any;
}

interface ClassSession {
  day: string;
  time: string;
}

export const CourseMode = ({ form }: CourseModeProps) => {
  const mode = form.watch("mode");
  const isVirtualLive = mode === "virtual-live";
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);

  // Update form value when classSessions change
  const updateClassSessionsInForm = (sessions: ClassSession[]) => {
    // Extract just the days for the form field that expects days only
    const days = sessions.map(session => session.day);
    
    // Set the days in the form
    form.setValue("classDays", days);
    
    // Create a sessions object that contains both days and times
    const sessionsMap = sessions.reduce((acc, session) => {
      acc[session.day] = session.time;
      return acc;
    }, {} as Record<string, string>);
    
    // Set the class times in the form (as a JSON string)
    form.setValue("classSchedule", JSON.stringify(sessionsMap));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    let newSessions = [...classSessions];
    
    if (checked) {
      // Add day if it doesn't exist
      if (!newSessions.some(session => session.day === day)) {
        newSessions.push({ day, time: "" });
      }
    } else {
      // Remove day if it exists
      newSessions = newSessions.filter(session => session.day !== day);
    }
    
    setClassSessions(newSessions);
    updateClassSessionsInForm(newSessions);
  };

  const handleTimeChange = (day: string, time: string) => {
    const newSessions = classSessions.map(session => 
      session.day === day ? { ...session, time } : session
    );
    
    setClassSessions(newSessions);
    updateClassSessionsInForm(newSessions);
  };

  return (
    <div className="space-y-6">
      {/* Course Mode Selection */}
      <FormField
        control={form.control}
        name="mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Mode</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                // Reset class sessions when switching away from virtual-live
                if (value !== "virtual-live") {
                  setClassSessions([]);
                  updateClassSessionsInForm([]);
                }
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select course mode" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="self-paced">Self-paced Course</SelectItem>
                <SelectItem value="virtual-live">Virtual Live Class</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose how students will take this course
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Mode-specific fields */}
      {mode === "self-paced" ? (
        <FormField
          control={form.control}
          name="accessDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Duration</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How long will students have access?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCESS_DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Period of time students will have access to course materials
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      {/* Virtual Live Class Settings */}
      {isVirtualLive && (
        <div className="space-y-6 border p-4 rounded-lg bg-muted/30">
          <h4 className="font-medium">Virtual Live Class Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Deadline */}
            <FormField
              control={form.control}
              name="registrationDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Registration Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Start Date */}
            <FormField
              control={form.control}
              name="courseStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Course Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Class Days with Times */}
          <FormField
            control={form.control}
            name="classDays"
            render={() => (
              <FormItem>
                <FormLabel>Class Schedule</FormLabel>
                <FormDescription>
                  Select the days when classes will take place and set the time for each day
                </FormDescription>
                <div className="space-y-4 mt-2">
                  {WEEKDAYS.map((day) => {
                    const isSelected = classSessions.some(session => session.day === day);
                    const sessionTime = classSessions.find(session => session.day === day)?.time || "";
                    
                    return (
                      <Card key={day} className={cn(
                        "border", 
                        isSelected ? "border-primary" : "border-gray-200"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  handleDayToggle(day, checked as boolean)
                                }
                              />
                              <label htmlFor={`day-${day}`} className="text-sm font-medium">
                                {day}
                              </label>
                            </div>
                            
                            {isSelected && (
                              <div className="w-32">
                                <Input 
                                  type="time"
                                  value={sessionTime}
                                  onChange={(e) => handleTimeChange(day, e.target.value)}
                                  placeholder="Class time"
                                  className="h-8"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Hidden field to store the class schedule */}
          <input 
            type="hidden" 
            {...form.register("classSchedule")} 
          />
        </div>
      )}
    </div>
  );
};
