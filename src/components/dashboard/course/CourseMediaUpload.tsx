
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Video } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

interface CourseMediaUploadProps {
  form: any;
  onImageChange: (file: File) => void;
  onMaterialsChange: (files: FileList) => void;
  imageUrl?: string;
}

export const CourseMediaUpload = ({ 
  form, 
  onImageChange, 
  onMaterialsChange, 
  imageUrl 
}: CourseMediaUploadProps) => {
  return (
    <div className="space-y-6">
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImageChange(file);
              }
            }}
            className="sr-only"
          />
        </div>
      </div>

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
              onChange={(e) => {
                if (e.target.files?.length) {
                  onMaterialsChange(e.target.files);
                }
              }}
              className="sr-only"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
