
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

  // If avatar url exists, append a cache-busting param.
  const avatarSrc = profileData?.avatar_url
    ? `${profileData.avatar_url}?cb=${Date.now()}`
    : undefined;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    const bucket = "avatars";
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;

    // Upload to bucket, public
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message || "We couldn't upload your image.",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    // Get public url
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      toast({
        title: "Could not get avatar URL",
        description: "Try re-uploading your image.",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    onUpload(publicUrl);

    toast({
      title: "Profile image updated!",
    });
    setUploading(false);
  };

  return (
    <div className="flex items-center space-x-4 mt-2">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarSrc} />
        <AvatarFallback>
          {fullName
            ? fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : profileData?.email?.charAt(0).toUpperCase()}
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
              <Loader className="animate-spin mr-1" />
              Uploading
            </>
          ) : (
            "Change Image"
          )}
        </Button>
      </div>
    </div>
  );
}
