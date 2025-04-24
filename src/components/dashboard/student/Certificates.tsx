
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Search, Download, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Certificate {
  id: string;
  certificate_number: string;
  issue_date: string;
  pdf_url: string;
  course: {
    title: string;
    instructor: {
      first_name: string;
      last_name: string;
    };
  };
}

const Certificates = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses (
            title,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('student_id', user?.id);

      if (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }

      return data as Certificate[];
    },
    enabled: !!user,
  });

  // Filter certificates based on search query
  const filteredCertificates = certificates?.filter(cert => 
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.course.instructor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.course.instructor.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Certificates</h1>
          <p className="text-gray-600">View and download your course completion certificates</p>
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

      {filteredCertificates?.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 mb-4">
            <Award className="h-8 w-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No certificates yet</h3>
          <p className="text-gray-500 mb-6">Complete courses to earn your first certificate</p>
          <Button asChild>
            <a href="/dashboard/my-courses">Continue Learning</a>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-3 px-4 font-medium text-gray-900">Certificate</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Instructor</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Issued On</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Certificate ID</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCertificates?.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>Certificate of Completion</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{certificate.course.title}</td>
                    <td className="py-3 px-4">
                      {certificate.course.instructor.first_name} {certificate.course.instructor.last_name}
                    </td>
                    <td className="py-3 px-4">{formatDate(certificate.issue_date)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono bg-gray-100 p-1 rounded">
                        {certificate.certificate_number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={!certificate.pdf_url}
                        onClick={() => certificate.pdf_url && window.open(certificate.pdf_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Certificate Verification</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Employers and other institutions can verify the authenticity of your certificates
              by entering the Certificate ID on our verification portal.
            </p>
            <Button variant="outline" asChild>
              <a href="/certificate-verification" target="_blank" rel="noopener noreferrer">
                Go to Verification Portal
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificates;
