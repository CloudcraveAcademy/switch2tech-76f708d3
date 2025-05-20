
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Video, Loader, Check, X, AlertCircle } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadStatus {
  file: File;
  name: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
}

export interface CourseMediaUploadProps {
  onCoverImageChange: (file: File) => void;
  onPreviewVideoChange?: (file: File) => void;
  onMaterialsChange?: (files: FileList) => void;
  imageUrl?: string;
  previewVideoUrl?: string;
  existingMaterials?: string[];
  materialUploads?: UploadStatus[];
  imageError?: boolean;
  form?: any; // Form object
  onMaterialRemove?: (url: string) => void;
}

export const CourseMediaUpload = ({ 
  onCoverImageChange,
  onPreviewVideoChange,
  onMaterialsChange,
  imageUrl,
  previewVideoUrl,
  existingMaterials = [],
  materialUploads = [],
  imageError = false,
  form,
  onMaterialRemove
}: CourseMediaUploadProps) => {
  const [materialFileNames, setMaterialFileNames] = useState<string[]>([]);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  
  // Handle file selection for course materials
  const handleMaterialsChange = (files: FileList) => {
    if (onMaterialsChange) {
      const newFileNames = Array.from(files).map(file => file.name);
      setMaterialFileNames(prevNames => [...prevNames, ...newFileNames]);
      onMaterialsChange(files);
    }
  };

  // Handle removal of existing material
  const handleMaterialRemove = (url: string) => {
    if (onMaterialRemove) {
      onMaterialRemove(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Preview Video */}
      <FormField
        control={form?.control}
        name="preview_video"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Preview Video</FormLabel>
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

      {/* Course Image - Required */}
      <div>
        <Label htmlFor="image" className="flex items-center">
          Course Image <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="mt-1 flex items-center space-x-4">
          {imageUrl && (
            <div className="shrink-0 h-20 w-32 overflow-hidden rounded-md border">
              <img
                src={imageUrl}
                alt="Course preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error("Error loading image:", e);
                  setImagePreviewError(true);
                  // If image fails to load, we'll show a placeholder
                  e.currentTarget.src = "/placeholder.svg";
                }}
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
                console.log("Image file selected:", file.name);
                onCoverImageChange(file);
                setImagePreviewError(false);
              }
            }}
            className="sr-only"
          />
        </div>
        {(imageError && !imageUrl) || imagePreviewError ? (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {imageError && !imageUrl ? "Course image is required" : "Unable to load image preview. Please try a different image."}
            </AlertDescription>
          </Alert>
        ) : null}
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
                  handleMaterialsChange(e.target.files);
                }
              }}
              className="sr-only"
            />

            {/* Show currently uploaded materials */}
            {existingMaterials && existingMaterials.length > 0 && (
              <div className="w-full mt-4 space-y-2">
                <p className="text-sm font-medium">Current materials:</p>
                {existingMaterials.map((url, idx) => {
                  const fileName = url.split('/').pop() || `Material ${idx + 1}`;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded">
                      <span className="truncate flex-1 text-xs">{fileName}</span>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          View
                        </a>
                        <button 
                          type="button" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleMaterialRemove(url)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show newly selected materials */}
            {materialFileNames.length > 0 && (
              <div className="w-full mt-4 space-y-2">
                <p className="text-sm font-medium">Files to upload:</p>
                {materialFileNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    <span className="truncate flex-1 text-xs">{name}</span>
                    <Loader className="h-4 w-4 animate-spin text-brand-600" />
                  </div>
                ))}
              </div>
            )}

            {/* Show upload indicators and results */}
            {materialUploads && materialUploads.length > 0 && (
              <div className="w-full mt-4 space-y-2">
                {materialUploads.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    <span className="truncate flex-1 text-xs">{item.name}</span>
                    {item.status === "uploading" && (
                      <Loader className="h-4 w-4 animate-spin text-brand-600" />
                    )}
                    {item.status === "success" && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {item.status === "error" && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    {item.status === "success" && item.url ? (
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
