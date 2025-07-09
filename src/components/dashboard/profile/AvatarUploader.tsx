
import { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

interface AvatarUploaderProps {
  profileData?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string | null;
    email?: string;
  };
  onUpload: (avatarUrl: string) => void;
}

export default function AvatarUploader({ profileData, onUpload }: AvatarUploaderProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fullName = `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    
    try {
      // Check if storage buckets are available
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      
      if (bucketListError) {
        console.error("Error listing buckets:", bucketListError);
        throw bucketListError;
      }
      
      const bucketName = "avatars";
      
      // Check if avatars bucket exists, create it if not
      if (!buckets?.some(b => b.name === bucketName)) {
        console.log("Creating avatars bucket");
        const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw bucketError;
        }
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;

      // Upload to bucket
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public url
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not get avatar URL");
      }

      // Make sure to call onUpload with the public URL
      onUpload(publicUrl);

      toast({
        title: "Profile image updated!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "We couldn't upload your image.",
        variant: "destructive",
      });
      console.error("Avatar upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 mt-2">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={profileData?.avatar_url || undefined} 
          alt={fullName || "User avatar"}
          loading="lazy"
        />
        <AvatarFallback>
          {fullName
            ? fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : profileData?.email?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader className="animate-spin mr-1 h-4 w-4" />
              Uploading
            </>
          ) : (
            "Change Image"
          )}
        </Button>
      </div>
    </div>
  );
};
