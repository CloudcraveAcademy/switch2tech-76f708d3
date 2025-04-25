
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

        {/* Multi-language Support */}
        <FormField
          control={form.control}
          name="multiLanguageSupport"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Multi-language Support
                </FormLabel>
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

      {/* Additional Languages */}
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
                            : currentLangs.filter((l: string) => l !== lang)
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
