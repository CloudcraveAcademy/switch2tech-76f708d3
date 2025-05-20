import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_ZONES = [
  "UTC",
  "GMT",
  "EST (UTC-5)",
  "CST (UTC-6)",
  "MST (UTC-7)",
  "PST (UTC-8)",
  "WAT (UTC+1)",
  "IST (UTC+5:30)",
  "JST (UTC+9)",
  "AEST (UTC+10)"
];

interface ClassTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export function CourseMode({ form }: { form: any }) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, { startTime: string, endTime: string }>>({});

  // Initialize values on component mount
  useEffect(() => {
    // Ensure classDays is an array
    const classDays = form.getValues('classDays') || [];
    setSelectedDays(classDays);
    
    // Create default time slots for initially selected days
    const initialTimeSlots: Record<string, { startTime: string, endTime: string }> = {};
    classDays.forEach((day: string) => {
      initialTimeSlots[day] = { startTime: "09:00", endTime: "10:00" };
    });
    
    setTimeSlots(initialTimeSlots);
    updateClassSchedule(initialTimeSlots);
  }, []);

  // Monitor changes to the form's classDays field
  useEffect(() => {
    const subscription = form.watch((value: any, { name }: { name?: string }) => {
      if (name === 'classDays') {
        const daysValue = value.classDays || [];
        setSelectedDays(daysValue);
        
        // Create default time slots for newly selected days
        const updatedTimeSlots = { ...timeSlots };
        daysValue.forEach((day: string) => {
          if (!updatedTimeSlots[day]) {
            updatedTimeSlots[day] = { startTime: "09:00", endTime: "10:00" };
          }
        });
        
        // Remove time slots for unselected days
        Object.keys(updatedTimeSlots).forEach(day => {
          if (!daysValue.includes(day)) {
            delete updatedTimeSlots[day];
          }
        });
        
        setTimeSlots(updatedTimeSlots);
        updateClassSchedule(updatedTimeSlots);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, timeSlots]);

  // Update the class schedule JSON in the form when time slots change
  const updateClassSchedule = (slots: Record<string, { startTime: string, endTime: string }>) => {
    form.setValue('class_time', JSON.stringify(slots));
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const updatedTimeSlots = { 
      ...timeSlots,
      [day]: { 
        ...timeSlots[day],
        [field]: value 
      }
    };
    setTimeSlots(updatedTimeSlots);
    updateClassSchedule(updatedTimeSlots);
  };

  return (
    <div className="space-y-6">
      {/* Course Mode Selection */}
      <FormField
        control={form.control}
        name="mode"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Course Mode <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self-paced" id="self-paced" />
                  <Label htmlFor="self-paced">Self-paced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="virtual-live" id="virtual-live" />
                  <Label htmlFor="virtual-live">Virtual Live Classes</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional Fields for Virtual Live Classes */}
      {form.watch('mode') === 'virtual-live' && (
        <div className="space-y-6 pl-6 border-l-2 border-gray-200">
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
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

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
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timezone Selection */}
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
                    {TIME_ZONES.map((timezone) => (
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

          {/* Class Days Selection */}
          <FormField
            control={form.control}
            name="classDays"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Class Days</FormLabel>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="classDays"
                      render={({ field }) => {
                        const currentValue = field.value || [];
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={currentValue.includes(day)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...currentValue, day]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter((value: string) => value !== day)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {day}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Class Times for Selected Days */}
          {selectedDays.length > 0 && (
            <div className="space-y-4 mt-4">
              <FormLabel>Class Times</FormLabel>
              {selectedDays.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <div className="w-24 font-medium">{day}</div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={timeSlots[day]?.startTime || "09:00"}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={timeSlots[day]?.endTime || "10:00"}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Replay Access */}
          <FormField
            control={form.control}
            name="replayAccess"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Enable Class Replay
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Access Duration for Self-Paced Courses */}
      {form.watch('mode') === 'self-paced' && (
        <FormField
          control={form.control}
          name="accessDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Duration</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="1 year">1 Year</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
