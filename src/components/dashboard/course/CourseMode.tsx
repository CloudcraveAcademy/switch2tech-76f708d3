
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

export const CourseMode = ({ form }: CourseModeProps) => {
  const mode = form.watch("mode");
  const isVirtualLive = mode === "virtual-live";

  return (
    <div className="space-y-6">
      {/* Course Mode Selection */}
      <FormField
        control={form.control}
        name="mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Mode</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {/* Class Time and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="classTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 6:00 PM - 8:00 PM"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>

          {/* Class Days */}
          <FormField
            control={form.control}
            name="classDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Days</FormLabel>
                <FormDescription>
                  Select the days when classes will take place
                </FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        value={day}
                        checked={field.value?.includes(day) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentDays = field.value || [];
                          field.onChange(
                            checked
                              ? [...currentDays, day]
                              : currentDays.filter((d: string) => d !== day)
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`day-${day}`} className="text-sm font-medium text-gray-700">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
