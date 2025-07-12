
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { Award, Download, ExternalLink, Search, Share2, Shield, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CertificateVerification from "./CertificateVerification";

interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
  issue_date: string;
  pdf_url: string;
  course: {
    id: string;
    title: string;
    image_url: string;
    level: string;
    instructor: {
      first_name: string;
      last_name: string;
    }
  }
}

const Certificates = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch certificates from Supabase
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses (
            id,
            title,
            image_url,
            level,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('student_id', user?.id)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }

      return data as Certificate[];
    },
    enabled: !!user?.id,
  });

  // Filter certificates based on search query
  const filteredCertificates = certificates?.filter(cert => 
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase())
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
      <Tabs defaultValue="my-certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="verify">Verify Certificate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-certificates" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center">
                <Award className="mr-2" /> My Certificates
              </h1>
              <p className="text-gray-600">View and manage your earned certificates</p>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No certificates yet</h3>
              <p className="text-gray-500 mb-6">Complete courses to earn your first certificate</p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates?.map(certificate => (
                <CertificateCard key={certificate.id} certificate={certificate} toast={toast} queryClient={queryClient} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="verify">
          <CertificateVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CertificateCardProps {
  certificate: Certificate;
  toast: any;
  queryClient: any;
}

const CertificateCard = ({ certificate, toast, queryClient }: CertificateCardProps) => {
  const handleShareCertificate = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate?cert=${certificate.certificate_number}`;
    
    // Always use clipboard as fallback since navigator.share has permission issues
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Certificate verification link copied to clipboard.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied",
        description: "Certificate verification link copied to clipboard.",
      });
    }
  };

  const copyVerificationCode = async () => {
    try {
      await navigator.clipboard.writeText(certificate.verification_code);
      toast({
        title: "Code Copied",
        description: "Verification code copied to clipboard.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = certificate.verification_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Code Copied",
        description: "Verification code copied to clipboard.",
      });
    }
  };

  // Generate PDF certificate
  const generatePdfMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      toast({
        title: "PDF Generation Not Available",
        description: "PDF generation feature is not yet implemented. Please contact support for a PDF copy of your certificate.",
        variant: "destructive",
      });
      throw new Error("PDF generation not implemented");
    },
    onSuccess: () => {
      // This won't be called since we always throw an error
    },
    onError: () => {
      // Error is handled in the mutationFn
    },
  });

  // Function to determine badge color based on course level
  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800";
      case 'advanced':
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card>
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-16 w-16 text-white opacity-20" />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
          <h3 className="font-bold text-lg truncate">
            {certificate.course.title}
          </h3>
          <p className="text-sm opacity-90">
            {certificate.course.instructor.first_name} {certificate.course.instructor.last_name}
          </p>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Certificate ID:</span>
            <span className="text-sm font-mono">{certificate.certificate_number}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Verification Code:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono">{certificate.verification_code}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyVerificationCode}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Issued on:</span>
            <span className="text-sm">{formatDate(certificate.issue_date)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Level:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeColor(certificate.course.level)}`}>
              {certificate.course.level}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {certificate.pdf_url ? (
          <Button className="w-full" asChild>
            <a href={certificate.pdf_url} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-1 h-4 w-4" />
              Download Certificate
            </a>
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => generatePdfMutation.mutate(certificate.id)}
            disabled={generatePdfMutation.isPending}
          >
            <Download className="mr-1 h-4 w-4" />
            {generatePdfMutation.isPending ? "Generating..." : "Generate PDF"}
          </Button>
        )}
        
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={handleShareCertificate}>
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/verify-certificate?cert=${certificate.certificate_number}`}>
              <Shield className="mr-1 h-4 w-4" />
              Verify
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Certificates;
