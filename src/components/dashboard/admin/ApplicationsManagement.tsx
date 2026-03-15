import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, CheckCircle, XCircle, User, Calendar, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ApplicationsManagement = () => {
  const queryClient = useQueryClient();

  // Fetch mentorship applications
  const { data: mentorshipApplications, isLoading: loadingMentorship } = useQuery({
    queryKey: ["mentorship-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_applications")
        .select(`
          *,
          mentorship_programs(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const applicationsWithProfiles = await Promise.all(
        (data || []).map(async (application) => {
          const { data: userProfile } = await supabase.rpc('get_user_basic_info', { 
            user_id_param: application.student_id 
          });
          
          return {
            ...application,
            user_profiles: userProfile?.[0] || { first_name: 'Unknown', last_name: 'User' }
          };
        })
      );
      
      return applicationsWithProfiles;
    },
  });

  // Fetch internship applications
  const { data: internshipApplications, isLoading: loadingInternships } = useQuery({
    queryKey: ["internship-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_applications")
        .select(`
          *,
          internship_programs(name, company)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const applicationsWithProfiles = await Promise.all(
        (data || []).map(async (application) => {
          const { data: userProfile } = await supabase.rpc('get_user_basic_info', { 
            user_id_param: application.student_id 
          });
          
          return {
            ...application,
            user_profiles: userProfile?.[0] || { first_name: 'Unknown', last_name: 'User' }
          };
        })
      );
      
      return applicationsWithProfiles;
    },
  });

  // Update application status
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, type }: { id: string; status: string; type: 'mentorship' | 'internship' }) => {
      const table = type === 'mentorship' ? 'mentorship_applications' : 'internship_applications';
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorship-applications"] });
      queryClient.invalidateQueries({ queryKey: ["internship-applications"] });
      toast({ title: "Application status updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating application status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const ApplicationDetails = ({ application, type }: { application: any; type: 'mentorship' | 'internship' }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-foreground">Applicant Information</h4>
          <p className="text-sm"><strong>Name:</strong> {application.user_profiles?.first_name} {application.user_profiles?.last_name}</p>
          <p className="text-sm"><strong>Phone:</strong> {application.phone_number || 'Not provided'}</p>
          <p className="text-sm"><strong>LinkedIn:</strong> {application.linkedin_profile || 'Not provided'}</p>
          <p className="text-sm"><strong>GitHub:</strong> {application.github_profile || 'Not provided'}</p>
          <p className="text-sm"><strong>Portfolio:</strong> {application.portfolio_url || 'Not provided'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Professional Information</h4>
          <p className="text-sm"><strong>Current Role:</strong> {application.user_current_role || 'Not provided'}</p>
          <p className="text-sm"><strong>Company:</strong> {application.user_current_company || 'Not provided'}</p>
          <p className="text-sm"><strong>Experience:</strong> {application.years_of_experience != null ? `${application.years_of_experience} years` : 'Not provided'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-foreground">Application Details</h4>
        <p className="text-sm"><strong>Program:</strong> {type === 'mentorship' ? application.mentorship_programs?.name : application.internship_programs?.name}</p>
        {type === 'internship' && <p className="text-sm"><strong>Company:</strong> {application.internship_programs?.company}</p>}
        {application.career_goals && <p className="text-sm"><strong>Career Goals:</strong> {application.career_goals}</p>}
        <p className="text-sm"><strong>Application Text:</strong> {application.application_text || 'No text provided'}</p>
      </div>

      {application.testimonial_text && (
        <div>
          <h4 className="font-semibold text-foreground">Testimonial</h4>
          <p className="text-sm">{application.testimonial_text}</p>
          <p className="text-sm"><strong>Consent for sharing:</strong> {application.testimonial_consent ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => updateApplicationStatus.mutate({ id: application.id, status: 'approved', type })}
          disabled={updateApplicationStatus.isPending || application.status === 'approved'}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => updateApplicationStatus.mutate({ id: application.id, status: 'rejected', type })}
          disabled={updateApplicationStatus.isPending || application.status === 'rejected'}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );

  const ApplicationTable = ({ applications, type, loading }: { applications: any[]; type: 'mentorship' | 'internship'; loading: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">Loading...</TableCell>
          </TableRow>
        ) : applications?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">No applications found</TableCell>
          </TableRow>
        ) : (
          applications?.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                {application.user_profiles?.first_name} {application.user_profiles?.last_name}
              </TableCell>
              <TableCell>
                {type === 'mentorship' 
                  ? application.mentorship_programs?.name 
                  : application.internship_programs?.name}
              </TableCell>
              <TableCell>{getStatusBadge(application.status)}</TableCell>
              <TableCell>
                {new Date(application.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {type === 'mentorship' ? 'Mentorship' : 'Internship'} Application Details
                      </DialogTitle>
                      <DialogDescription>
                        Review the application and take action
                      </DialogDescription>
                    </DialogHeader>
                    <ApplicationDetails application={application} type={type} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Applications Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Applications</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentorshipApplications?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internshipApplications?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...(mentorshipApplications || []), ...(internshipApplications || [])]
                .filter(app => app.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mentorship" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentorship">Mentorship Applications</TabsTrigger>
          <TabsTrigger value="internship">Internship Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="mentorship">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTable 
                applications={mentorshipApplications || []} 
                type="mentorship" 
                loading={loadingMentorship} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internship">
          <Card>
            <CardHeader>
              <CardTitle>Internship Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTable 
                applications={internshipApplications || []} 
                type="internship" 
                loading={loadingInternships} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationsManagement;
