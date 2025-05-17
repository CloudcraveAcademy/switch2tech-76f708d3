
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const COURSE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels"
];

interface CourseBasicInfoProps {
  form: any;
  categories?: Category[];
  categoriesLoading?: boolean;
}

export function CourseBasicInfo({ form, categories = [], categoriesLoading = false }: CourseBasicInfoProps) {
  // Log categories for debugging
  useEffect(() => {
    if (categories && categories.length > 0) {
      console.log("CourseBasicInfo received categories:", categories);
    }
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Course Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Title <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Enter course title" {...field} />
            </FormControl>
            <FormDescription>
              A clear and concise title that describes your course.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Course Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Description <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter a detailed description of your course" 
                className="min-h-32" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Provide a detailed description of what students will learn in this course.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Level */}
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Level <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COURSE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The difficulty level of your course.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Course Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
              {categoriesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>The category your course belongs to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Course Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (hours) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>The total length of your course in hours.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
