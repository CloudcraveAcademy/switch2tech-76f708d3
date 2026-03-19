import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Clock, CheckCircle, XCircle } from "lucide-react";

const MyApplications = () => {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const [mentorshipRes, internshipRes] = await Promise.all([
        supabase
          .from("mentorship_applications")
          .select("id, status, created_at, program_id, mentorship_programs(name)")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("internship_applications")
          .select("id, status, created_at, program_id, internship_programs(name, company)")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const mentorships = (mentorshipRes.data || []).map((app) => ({
        ...app,
        type: "mentorship" as const,
        programName: (app as any).mentorship_programs?.name || "Unknown Program",
      }));

      const internships = (internshipRes.data || []).map((app) => ({
        ...app,
        type: "internship" as const,
        programName: (app as any).internship_programs?.name || "Unknown Program",
        company: (app as any).internship_programs?.company,
      }));

      return [...mentorships, ...internships].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Applications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              {app.type === "mentorship" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : (
                <Briefcase className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">{app.programName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {app.type} • {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {getStatusBadge(app.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MyApplications;
