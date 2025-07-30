
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Globe, Award } from "lucide-react";

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

interface CourseSettingsProps {
  form: any;
}

export const CourseSettings = ({ form }: CourseSettingsProps) => {
  const multiLanguageSupport = form.watch("multiLanguageSupport");

  return (
    <div className="space-y-6">
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

      </div>

      {/* Certificate Upon Completion */}
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
    </div>
  );
};
