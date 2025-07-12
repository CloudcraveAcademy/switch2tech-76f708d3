
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

  // Generate certificate HTML for printing
  const generateCertificateMutation = useMutation({
    mutationFn: async (certificate: Certificate) => {
      return generateCertificateHTML(certificate);
    },
    onSuccess: (htmlContent: string) => {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
      toast({
        title: "Certificate Ready",
        description: "Certificate opened in new window. Use browser's print function to save as PDF.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate certificate.",
        variant: "destructive",
      });
    },
  });

  const generateCertificateHTML = (certificate: Certificate) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .certificate {
            background: white;
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            text-align: center;
            width: 100%;
            max-width: 800px;
            position: relative;
        }
        .logo-container {
            position: absolute;
            top: 30px;
            left: 30px;
            display: flex;
            align-items: center;
        }
        .logo-image {
            height: 40px;
            width: auto;
        }
        .logo-text {
            margin-left: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
        }
        .seal {
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 12px;
            letter-spacing: 1px;
        }
        .header {
            margin-bottom: 40px;
        }
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 18px;
            color: #718096;
            font-weight: 300;
        }
        .recipient {
            margin: 40px 0;
        }
        .recipient-label {
            font-size: 16px;
            color: #718096;
            margin-bottom: 10px;
        }
        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2d3748;
            border-bottom: 2px solid #667eea;
            display: inline-block;
            padding-bottom: 5px;
        }
        .course-info {
            margin: 40px 0;
        }
        .course-title {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .course-details {
            font-size: 16px;
            color: #718096;
        }
        .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .date-section, .signature-section {
            text-align: center;
        }
        .date, .signature-line {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
            min-width: 150px;
            font-weight: 500;
        }
        .label {
            font-size: 14px;
            color: #718096;
        }
        .verification {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .verification-code {
            font-size: 12px;
            color: #718096;
            font-family: monospace;
        }
        .verify-link {
            color: #667eea;
            text-decoration: none;
            font-size: 12px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="logo-container">
            <img src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" alt="Switch2Tech Academy" class="logo-image" />
            <span class="logo-text">Switch2Tech</span>
        </div>
        <div class="seal">CERTIFIED</div>
        <div class="header">
            <h1 class="title">Certificate of Completion</h1>
            <p class="subtitle">This is to certify that</p>
        </div>
        
        <div class="recipient">
            <p class="recipient-label">has successfully completed</p>
            <h2 class="recipient-name">${certificate.student.first_name} ${certificate.student.last_name}</h2>
        </div>
        
        <div class="course-info">
            <h3 class="course-title">${certificate.course.title}</h3>
            <p class="course-details">Level: ${certificate.course.level}</p>
        </div>
        
        <div class="footer">
            <div class="date-section">
                <div class="date">${new Date(certificate.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div class="label">Date of Completion</div>
            </div>
            
            <div class="signature-section">
                <div class="signature-line">Switch2Tech Academy</div>
                <div class="label">Authorized Signature</div>
            </div>
        </div>
        
        <div class="verification">
            <p class="verification-code">Certificate Number: ${certificate.certificate_number}</p>
            <p class="verification-code">Verification Code: ${certificate.verification_code}</p>
            <a href="${window.location.origin}/verify-certificate" class="verify-link">Verify this certificate online</a>
        </div>
    </div>
</body>
</html>
    `;
  };

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
                            onClick={() => generateCertificateMutation.mutate(certificate)}
                            disabled={generateCertificateMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Print Certificate
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => generateCertificateMutation.mutate(certificate)}
                          disabled={generateCertificateMutation.isPending}
                        >
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
