
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const successStorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  story: z.string().min(50, "Story must be at least 50 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"), 
  company: z.string().min(2, "Company must be at least 2 characters"),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  video_url: z.string().url("Please enter a valid video URL").optional().or(z.literal(""))
});

type SuccessStoryFormData = z.infer<typeof successStorySchema>;

const SubmitSuccessStory = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SuccessStoryFormData>({
    resolver: zodResolver(successStorySchema),
    defaultValues: {
      name: "",
      story: "",
      role: "",
      company: "",
      image_url: "",
      video_url: ""
    }
  });

  const onSubmit = async (data: SuccessStoryFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your success story",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('student_success_stories')
        .insert({
          name: data.name,
          story: data.story,
          role: data.role,
          company: data.company,
          image_url: data.image_url || null,
          video_url: data.video_url || null,
          submitted_by: user.id,
          is_approved: false,
          is_featured: false
        });

      if (error) {
        console.error('Error submitting story:', error);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your story. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Story Submitted Successfully!",
        description: "Your success story has been submitted for review. It will be published once approved by our admin team.",
      });

      navigate("/success-stories");
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link 
                to="/success-stories" 
                className="inline-flex items-center text-brand hover:text-brand/80 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Success Stories
              </Link>
              <h1 className="text-3xl font-bold mb-2">Share Your Success Story</h1>
              <p className="text-gray-600">
                Inspire others by sharing how Switch2Tech helped transform your career. 
                Your story will be reviewed by our team before being published.
              </p>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell Us About Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Full Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter your full name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Current Role *</Label>
                    <Input
                      id="role"
                      {...form.register("role")}
                      placeholder="e.g., Software Engineer, Data Scientist"
                    />
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      placeholder="Enter your current company"
                    />
                    {form.formState.errors.company && (
                      <p className="text-sm text-red-600">{form.formState.errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story">Your Success Story *</Label>
                    <Textarea
                      id="story"
                      {...form.register("story")}
                      placeholder="Tell us about your journey - what was your background before Switch2Tech? How did our program help you? What advice would you give to others? (Minimum 50 characters)"
                      className="min-h-32"
                    />
                    {form.formState.errors.story && (
                      <p className="text-sm text-red-600">{form.formState.errors.story.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Profile Image URL (Optional)</Label>
                    <Input
                      id="image_url"
                      {...form.register("image_url")}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                    <p className="text-sm text-gray-500">
                      You can upload your image to any image hosting service and paste the URL here
                    </p>
                    {form.formState.errors.image_url && (
                      <p className="text-sm text-red-600">{form.formState.errors.image_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video Story URL (Optional)</Label>
                    <Input
                      id="video_url"
                      {...form.register("video_url")}
                      placeholder="https://example.com/your-video.mp4"
                    />
                    <p className="text-sm text-gray-500">
                      Have a video testimonial? Upload it to any video hosting service and paste the URL here
                    </p>
                    {form.formState.errors.video_url && (
                      <p className="text-sm text-red-600">{form.formState.errors.video_url.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Review Process</h3>
                    <p className="text-sm text-blue-800">
                      Your story will be reviewed by our admin team to ensure it meets our community guidelines. 
                      Once approved, it will be published on our success stories page. This usually takes 1-3 business days.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-brand hover:bg-brand/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Story...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Success Story
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitSuccessStory;
