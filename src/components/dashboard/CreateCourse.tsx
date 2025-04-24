
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookPlus, 
  Loader2, 
  Calendar, 
  Clock,
  Video,
  FileText,
  DollarSign,
  Globe,
  Award, // Replaced Certificate with Award which is available in lucide-react
  ToggleLeft, // Replaced Toggle with ToggleLeft which is available in lucide-react
  Users
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

// Updated to match database constraints - using lowercase values
const LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"];

const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Spanish",
  "Portuguese",
  "Arabic",
  "Chinese",
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

const ACCESS_DURATION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days (6 months)" },
  { value: "365", label: "365 days (1 year)" },
  { value: "lifetime", label: "Lifetime" },
];

// Form schema for course creation
const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  duration: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Duration must be a valid number greater than 0",
  }),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  mode: z.enum(["self-paced", "virtual-live"]),
  
  // Fields for both modes
  language: z.string().min(1, "Language is required"),
  multiLanguageSupport: z.boolean().default(false),
  additionalLanguages: z.array(z.string()).optional(),
  certificateEnabled: z.boolean().default(false),
  previewVideo: z.string().optional(),
  
  // Self-paced specific fields
  accessDuration: z.string().optional(),
  
  // Virtual Live specific fields
  registrationDeadline: z.date().optional(),
  courseStartDate: z.date().optional(),
  classDays: z.array(z.string()).optional(),
  classTime: z.string().optional(),
  timezone: z.string().optional(),
  replayAccess: z.boolean().default(false),
  
  // Discount fields
  discountEnabled: z.boolean().default(false),
  discountedPrice: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [courseMaterials, setCourseMaterials] = useState<File[]>([]);
  
  // Fetch categories
  const { data: categories } = useCategories();

  // Initialize the form with react-hook-form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      duration: "",
      level: "",
      category: "",
      mode: "self-paced",
      language: "English",
      multiLanguageSupport: false,
      certificateEnabled: false,
      additionalLanguages: [],
      discountEnabled: false,
      replayAccess: false,
    },
  });

  // Get current form values
  const mode = form.watch("mode");
  const multiLanguageSupport = form.watch("multiLanguageSupport");
  const discountEnabled = form.watch("discountEnabled");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleMaterialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCourseMaterials(Array.from(files));
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to create a course",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let finalImageUrl = "";
      let materialUrls: string[] = [];
      
      // Upload image to Supabase Storage if available
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `course-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, image);
          
        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        
        const { data: imageData } = supabase.storage.from('course-materials').getPublicUrl(filePath);
        finalImageUrl = imageData.publicUrl;
      }
      
      // Upload course materials if available
      if (courseMaterials.length > 0) {
        for (const material of courseMaterials) {
          const fileExt = material.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `course-materials/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, material);
            
          if (uploadError) {
            throw new Error(`Error uploading material: ${uploadError.message}`);
          }
          
          const { data: materialData } = supabase.storage.from('course-materials').getPublicUrl(filePath);
          materialUrls.push(materialData.publicUrl);
        }
      }
      
      // Prepare course data for database
      const courseData = {
        instructor_id: user.id,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        duration_hours: Number(data.duration),
        level: data.level.toLowerCase(),
        category: data.category,
        image_url: finalImageUrl,
        is_published: false,
        mode: data.mode,
        language: data.language,
        multi_language_support: data.multiLanguageSupport,
        additional_languages: data.multiLanguageSupport ? data.additionalLanguages : null,
        certificate_enabled: data.certificateEnabled,
        preview_video: data.previewVideo,
        course_materials: materialUrls.length > 0 ? materialUrls : null,
      };
      
      // Add mode-specific data
      if (data.mode === "self-paced") {
        Object.assign(courseData, {
          access_duration: data.accessDuration,
        });
      } else if (data.mode === "virtual-live") {
        Object.assign(courseData, {
          registration_deadline: data.registrationDeadline,
          course_start_date: data.courseStartDate,
          class_days: data.classDays,
          class_time: data.classTime,
          timezone: data.timezone,
          replay_access: data.replayAccess,
        });
      }
      
      // Add discount data if enabled
      if (data.discountEnabled) {
        Object.assign(courseData, {
          discounted_price: Number(data.discountedPrice),
        });
      }
      
      // Create course in database
      const { data: course, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select('id')
        .single();
      
      if (error) {
        throw new Error(`Error creating course: ${error.message}`);
      }
      
      toast({
        title: "Course created successfully",
        description: "Your course has been saved as a draft",
      });
      
      // Navigate to the correct course edit route
      navigate(`/dashboard/courses/${course.id}/edit`);
    } catch (error: any) {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BookPlus className="mr-2" /> Create New Course
        </h1>
        <p className="text-gray-600">Fill out the form below to create a new course</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Enter the information about your course. You can edit and add more content later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Course Mode Selection */}
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Mode</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[150px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₦)*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="number" 
                            className="pl-9"
                            placeholder="e.g. 10000"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="number" 
                            className="pl-9"
                            placeholder="e.g. 10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level */}
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEVEL_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Multi-language Support */}
                <FormField
                  control={form.control}
                  name="multiLanguageSupport"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Multi-language Support</FormLabel>
                        <FormDescription>
                          Enable support for multiple languages
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Languages (if multi-language support is enabled) */}
              {multiLanguageSupport && (
                <FormField
                  control={form.control}
                  name="additionalLanguages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Languages</FormLabel>
                      <FormDescription>
                        Select additional languages for your course
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {LANGUAGE_OPTIONS.filter(lang => lang !== form.getValues("language")).map((lang) => (
                          <div key={lang} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`lang-${lang}`}
                              value={lang}
                              checked={field.value?.includes(lang) || false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const currentLangs = field.value || [];
                                field.onChange(
                                  checked
                                    ? [...currentLangs, lang]
                                    : currentLangs.filter((l) => l !== lang)
                                );
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`lang-${lang}`} className="text-sm font-medium text-gray-700">
                              {lang}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Certificate Upon Completion - Update icon reference from CertificateIcon to Award */}
              <FormField
                control={form.control}
                name="certificateEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        <Award className="mr-2 h-4 w-4" />
                        Certificate Upon Completion
                      </FormLabel>
                      <FormDescription>
                        Students will receive a certificate when they complete this course
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Course Preview Video */}
              <FormField
                control={form.control}
                name="previewVideo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Preview Video (URL)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          {...field}
                          placeholder="YouTube or Vimeo link"
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add a preview video to showcase your course (YouTube or Vimeo URL)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MODE-SPECIFIC FIELDS */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  {mode === "self-paced" ? "Self-paced Course Settings" : "Virtual Live Class Settings"}
                </h3>

                {/* SELF-PACED MODE FIELDS */}
                {mode === "self-paced" && (
                  <div className="space-y-6">
                    {/* Access Duration */}
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

                    {/* Course Materials Upload */}
                    <div>
                      <FormLabel>Course Materials</FormLabel>
                      <div className="mt-2 p-4 border-2 border-dashed rounded-md">
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">Upload course materials</p>
                          <p className="text-xs text-gray-500 mb-4">PDFs, documents, presentations, etc.</p>
                          <Label
                            htmlFor="materials-upload"
                            className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Choose files
                          </Label>
                          <Input
                            id="materials-upload"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                            onChange={handleMaterialsChange}
                            className="sr-only"
                          />
                        </div>
                        {courseMaterials.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Selected files:</p>
                            <ul className="text-xs list-disc pl-5">
                              {courseMaterials.map((file, index) => (
                                <li key={index}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* VIRTUAL LIVE CLASS MODE FIELDS */}
                {mode === "virtual-live" && (
                  <div className="space-y-6">
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
                                    variant={"outline"}
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
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Last day students can register for this class
                            </FormDescription>
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
                                    variant={"outline"}
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
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
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
                                        : currentDays.filter((d) => d !== day)
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Class Time */}
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
                    </div>

                    {/* Replay Access */}
                    <FormField
                      control={form.control}
                      name="replayAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Replay Access Available</FormLabel>
                            <FormDescription>
                              Students can rewatch recorded sessions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* PRICING AND DISCOUNT */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4">Pricing Options</h3>

                {/* Discount Option */}
                <FormField
                  control={form.control}
                  name="discountEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg mb-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Discount</FormLabel>
                        <FormDescription>
                          Offer this course at a discounted price
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Discounted Price (if discount is enabled) */}
                {discountEnabled && (
                  <FormField
                    control={form.control}
                    name="discountedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discounted Price (₦)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              {...field}
                              type="number" 
                              className="pl-9"
                              placeholder="e.g. 8000"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The discounted price must be lower than the original price
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Course Image */}
              <div>
                <Label htmlFor="image">Course Image (optional)</Label>
                <div className="mt-1 flex items-center space-x-4">
                  {imageUrl && (
                    <div className="shrink-0 h-20 w-32 overflow-hidden rounded-md border">
                      <img
                        src={imageUrl}
                        alt="Course preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {imageUrl ? "Change image" : "Upload image"}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
