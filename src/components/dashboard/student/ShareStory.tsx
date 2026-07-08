import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  role: z.string().trim().min(2, "Current role is required").max(100),
  company: z.string().trim().min(1, "Company is required").max(100),
  story: z.string().trim().min(50, "Story should be at least 50 characters").max(2000),
  image_url: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

const ShareStory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name || "",
    role: "",
    company: "",
    story: "",
    image_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/testimonial-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Could not get public URL");
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast({ title: "Photo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };


  const { data: mySubmissions, isLoading: loadingMine } = useQuery({
    queryKey: ["my-success-stories", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_success_stories")
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { error } = await supabase.from("student_success_stories").insert({
        name: values.name,
        role: values.role,
        company: values.company,
        story: values.story,
        image_url: values.image_url || null,
        submitted_by: user!.id,
        is_approved: false,
        is_featured: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Story submitted!",
        description: "Your story is pending admin review.",
      });
      setForm({ name: user?.name || "", role: "", company: "", story: "", image_url: "" });
      queryClient.invalidateQueries({ queryKey: ["my-success-stories"] });
    },
    onError: (err: any) =>
      toast({ title: "Submission failed", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    submitMutation.mutate(parsed.data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Share Your Success Story</h1>
        <p className="text-muted-foreground mt-1">
          Inspire other learners. Your story will be reviewed by our team before appearing publicly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Story</CardTitle>
          <CardDescription>Tell us how Switch2Tech helped transform your career.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="role">Current Role</Label>
                <Input id="role" placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Where you work now" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
            </div>

            <div>
              <Label>Your Photo (optional)</Label>
              <Tabs defaultValue="url" className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-3">
                  <Input
                    id="image_url"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Drive share links are supported.
                  </p>
                </TabsContent>
                <TabsContent value="upload" className="mt-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Choose image</>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
              {form.image_url && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border"
                    referrerPolicy="no-referrer"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({ ...form, image_url: "" })}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              {errors.image_url && <p className="text-sm text-destructive mt-1">{errors.image_url}</p>}
            </div>


            <div>
              <Label htmlFor="story">Your Story</Label>
              <Textarea
                id="story"
                rows={7}
                placeholder="Share your journey, challenges, and how Switch2Tech helped you succeed..."
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">{form.story.length}/2000</p>
              {errors.story && <p className="text-sm text-destructive mt-1">{errors.story}</p>}
            </div>

            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Story
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMine ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !mySubmissions || mySubmissions.length === 0 ? (
            <p className="text-muted-foreground">You haven't submitted any stories yet.</p>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{s.role} at {s.company}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{s.story}</p>
                  </div>
                  <Badge variant={s.is_approved ? "default" : "outline"}>
                    {s.is_approved ? "Approved" : "Pending Review"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareStory;
