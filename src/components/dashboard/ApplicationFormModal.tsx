import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, Star, FileText } from "lucide-react";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationType: 'mentorship' | 'internship';
}

interface FormData {
  program_id: string;
  application_text: string;
  user_current_role: string;
  user_current_company: string;
  career_goals: string;
  linkedin_profile: string;
  github_profile: string;
  portfolio_url: string;
  phone_number: string;
  years_of_experience: number | undefined;
  testimonial_text: string;
  testimonial_consent: boolean;
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  applicationType,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    program_id: '',
    application_text: '',
    user_current_role: '',
    user_current_company: '',
    career_goals: '',
    linkedin_profile: '',
    github_profile: '',
    portfolio_url: '',
    phone_number: '',
    years_of_experience: undefined,
    testimonial_text: '',
    testimonial_consent: false,
  });

  // Fetch available programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: [`${applicationType}-programs`],
    queryFn: async () => {
      const table = applicationType === 'mentorship' ? 'mentorship_programs' : 'internship_programs';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  // Check for existing application
  const { data: existingApplication } = useQuery({
    queryKey: [`${applicationType}-application`, user?.id],
    queryFn: async () => {
      const table = applicationType === 'mentorship' ? 'mentorship_applications' : 'internship_applications';
      const { data, error } = await supabase
        .from(table)
        .select('id, status')
        .eq('student_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Submit application
  const submitApplication = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const table = applicationType === 'mentorship' ? 'mentorship_applications' : 'internship_applications';
      const applicationData = {
        ...data,
        student_id: user.id,
        status: 'pending',
      };

      const { error } = await supabase
        .from(table)
        .insert([applicationData]);

      if (error) throw error;

      // If user provided testimonial and consented, create testimonial record
      if (data.testimonial_text && data.testimonial_consent) {
        const { error: testimonialError } = await supabase
          .from('student_success_stories')
          .insert([{
            name: `${user.name || 'Student'}`,
            story: data.testimonial_text,
            role: data.user_current_role || 'Student',
            company: data.user_current_company || 'N/A',
            application_type: applicationType,
            is_approved: false,
            is_featured: false,
          }]);

        if (testimonialError) {
          console.error('Error saving testimonial:', testimonialError);
          // Don't throw here as the main application succeeded
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${applicationType}-application`] });
      toast({
        title: "Application submitted successfully!",
        description: `Your ${applicationType} application has been received and is under review.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || `Failed to submit ${applicationType} application.`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      program_id: '',
      application_text: '',
      user_current_role: '',
      user_current_company: '',
      career_goals: '',
      linkedin_profile: '',
      github_profile: '',
      portfolio_url: '',
      phone_number: '',
      years_of_experience: undefined,
      testimonial_text: '',
      testimonial_consent: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.program_id) {
      toast({
        title: "Program required",
        description: "Please select a program to apply for.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.application_text.trim()) {
      toast({
        title: "Application text required",
        description: "Please provide your application details.",
        variant: "destructive",
      });
      return;
    }

    submitApplication.mutate(formData);
  };

  const handleClose = () => {
    if (!submitApplication.isPending) {
      onClose();
      resetForm();
    }
  };

  if (existingApplication) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Application Already Exists</DialogTitle>
            <DialogDescription>
              You already have a {existingApplication.status} {applicationType} application.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {applicationType === 'mentorship' ? <User className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
            Apply for {applicationType === 'mentorship' ? 'Mentorship Program' : 'Internship Program'}
          </DialogTitle>
          <DialogDescription>
            Complete the form below to apply for our {applicationType} program. 
            Your information will help us match you with the best opportunities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Program Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Program Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="program">Choose Program *</Label>
                <Select 
                  value={formData.program_id} 
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                  disabled={programsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={programsLoading ? "Loading programs..." : "Select a program"} />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((program: any) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} {applicationType === 'internship' && program.company ? `- ${program.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personal & Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal & Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_role">Current Role</Label>
                  <Input
                    id="current_role"
                    value={formData.user_current_role}
                    onChange={(e) => setFormData({ ...formData, user_current_role: e.target.value })}
                    placeholder="e.g., Student, Developer, Designer"
                  />
                </div>
                <div>
                  <Label htmlFor="current_company">Current Company/School</Label>
                  <Input
                    id="current_company"
                    value={formData.user_current_company}
                    onChange={(e) => setFormData({ ...formData, user_current_company: e.target.value })}
                    placeholder="e.g., University of Lagos, Tech Company"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_of_experience || ''}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin_profile}
                    onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub Profile</Label>
                  <Input
                    id="github"
                    value={formData.github_profile}
                    onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="career_goals">Career Goals *</Label>
                <Textarea
                  id="career_goals"
                  value={formData.career_goals}
                  onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                  placeholder="Describe your career goals and how this program will help you achieve them..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="application_text">Why do you want to join this program? *</Label>
                <Textarea
                  id="application_text"
                  value={formData.application_text}
                  onChange={(e) => setFormData({ ...formData, application_text: e.target.value })}
                  placeholder="Tell us about your motivation, what you hope to gain, and what you can contribute..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Testimonial Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-4 w-4" />
                Share Your Success Story (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testimonial">Your Success Story</Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial_text}
                  onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                  placeholder="Share your journey, achievements, or how technology/education has impacted your life. This helps inspire other students..."
                  rows={4}
                />
              </div>

              {formData.testimonial_text && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="testimonial_consent"
                    checked={formData.testimonial_consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, testimonial_consent: !!checked })}
                  />
                  <Label htmlFor="testimonial_consent" className="text-sm">
                    I consent to sharing my success story publicly to inspire other students
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitApplication.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitApplication.isPending}>
              {submitApplication.isPending ? "Submitting..." : `Submit Application`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;