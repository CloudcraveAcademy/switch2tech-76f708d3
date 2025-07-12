
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Award, Search, Download, Eye, Users, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
  issue_date: string;
  pdf_url?: string;
  student: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  course: {
    title: string;
    level: string;
  };
}

const InstructorCertificates = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch certificates for instructor's courses
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['instructor-certificates', user?.id],
    queryFn: async () => {
      // First get instructor's courses
      const { data: instructorCourses, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', user?.id);

      if (coursesError) {
        console.error('Error fetching instructor courses:', coursesError);
        return [];
      }

      const courseIds = instructorCourses.map(course => course.id);

      if (courseIds.length === 0) {
        return [];
      }

      // Then get certificates for those courses
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          student:user_profiles!student_id (
            first_name,
            last_name
          ),
          course:courses (
            title,
            level
          )
        `)
        .in('course_id', courseIds)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }

      return data as Certificate[];
    },
    enabled: !!user?.id,
  });

  // Get course statistics
  const { data: stats } = useQuery({
    queryKey: ['instructor-certificate-stats', user?.id],
    queryFn: async () => {
      // Get instructor's courses first
      const { data: instructorCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', user?.id);

      const courseIds = instructorCourses?.map(course => course.id) || [];

      const [certificatesResponse, coursesResponse] = await Promise.all([
        courseIds.length > 0 ? supabase
          .from('certificates')
          .select('id', { count: 'exact' })
          .in('course_id', courseIds) : { count: 0 },
        supabase
          .from('courses')
          .select('id', { count: 'exact' })
          .eq('instructor_id', user?.id)
          .eq('certificate_enabled', true)
      ]);

      return {
        totalCertificates: certificatesResponse.count || 0,
        certificateEnabledCourses: coursesResponse.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  // Generate PDF certificate
  const generatePdfMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      // Generate a mock PDF URL for demonstration
      // In production, this would call an edge function or PDF generation service
      const timestamp = Date.now();
      const pdfUrl = `${window.location.origin}/api/certificates/${certificateId}.pdf?t=${timestamp}`;
      
      const { error } = await supabase
        .from('certificates')
        .update({ pdf_url: pdfUrl })
        .eq('id', certificateId);

      if (error) throw error;
      return pdfUrl;
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "Certificate PDF has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['instructor-certificates'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate PDF certificate.",
        variant: "destructive",
      });
    },
  });

  // Filter certificates based on search
  const filteredCertificates = certificates?.filter(cert => 
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${cert.student.first_name} ${cert.student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center">
            <Award className="mr-2" /> Certificate Management
          </h1>
          <p className="text-gray-600">Manage certificates for your courses</p>
        </div>
        
        <div className="relative mt-4 md:mt-0 w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search certificates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Award className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold">{stats?.totalCertificates || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Certificate-Enabled Courses</p>
              <p className="text-2xl font-bold">{stats?.certificateEnabledCourses || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Students</p>
              <p className="text-2xl font-bold">
                {new Set(certificates?.map(c => c.student.first_name + c.student.last_name)).size || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCertificates?.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No certificates found</h3>
              <p className="text-gray-500">Certificates will appear here when students complete your courses</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Certificate Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates?.map(certificate => (
                  <TableRow key={certificate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {certificate.student.first_name} {certificate.student.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{certificate.course.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {certificate.course.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {certificate.certificate_number}
                      </code>
                    </TableCell>
                    <TableCell>{formatDate(certificate.issue_date)}</TableCell>
                    <TableCell>
                      <Badge variant={certificate.pdf_url ? "default" : "secondary"}>
                        {certificate.pdf_url ? "PDF Available" : "Pending PDF"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {certificate.pdf_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={certificate.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePdfMutation.mutate(certificate.id)}
                            disabled={generatePdfMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Generate PDF
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorCertificates;
