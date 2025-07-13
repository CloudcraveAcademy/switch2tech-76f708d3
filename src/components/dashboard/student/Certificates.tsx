import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Download, Share2, Shield, Copy, Search, Eye } from "lucide-react";
import { generateCertificateHTML } from "@/components/common/CertificateTemplate";

// Certificate interface
interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
  issue_date: string;
  pdf_url?: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
  };
  course: {
    id: string;
    title: string;
    level: string;
    instructor: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

// Certificates component
export default function Certificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch certificates
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          student:student_id(id, first_name, last_name),
          course:course_id(
            id,
            title,
            level,
            instructor:instructor_id(id, first_name, last_name)
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user?.id,
  });

  // Filter certificates based on search
  const filteredCertificates = certificates?.filter(cert => 
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Certificates</h2>
        <p className="text-muted-foreground">
          View and manage your earned certificates
        </p>
      </div>

      <Tabs defaultValue="my-certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="verify">Verify Certificate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-certificates" className="space-y-6">
          {certificates && certificates.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? "No certificates match your search." : "Complete courses to earn certificates."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCertificates.map((certificate) => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate} 
                  toast={toast}
                  queryClient={queryClient}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="verify">
          <VerifyCertificate />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Certificate Card Component
interface CertificateCardProps {
  certificate: Certificate;
  toast: any;
  queryClient: any;
}

const CertificateCard = ({ certificate, toast, queryClient }: CertificateCardProps) => {
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Share certificate function
  const handleShareCertificate = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate?cert=${certificate.certificate_number}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.course.title}`,
          text: `Check out my certificate for completing ${certificate.course.title}!`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Certificate link copied to clipboard!",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Certificate link copied to clipboard!",
      });
    }
  };

  // Copy verification code
  const copyVerificationCode = async () => {
    await navigator.clipboard.writeText(certificate.verification_code);
    toast({
      title: "Copied",
      description: "Verification code copied to clipboard!",
    });
  };

  // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: async (certificate: Certificate) => {
      const certificateWindow = window.open('', '_blank');
      if (!certificateWindow) {
        throw new Error('Unable to open certificate window');
      }

      const html = generateCertificateHTML(certificate);
      
      certificateWindow.document.write(html);
      certificateWindow.document.close();
      
      // Wait for the content to load before focusing
      setTimeout(() => {
        if (certificateWindow && !certificateWindow.closed) {
          certificateWindow.focus();
        }
      }, 500);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Certificate Generated",
        description: "Certificate opened for printing. Use Ctrl+P or Cmd+P to save as PDF.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
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
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => generatePdfMutation.mutate(certificate)}
            disabled={generatePdfMutation.isPending}
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button 
            className="flex-1" 
            onClick={() => generatePdfMutation.mutate(certificate)}
            disabled={generatePdfMutation.isPending}
          >
            <Download className="mr-1 h-4 w-4" />
            {generatePdfMutation.isPending ? "Opening..." : "Print Certificate"}
          </Button>
        </div>
        
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

// Verify Certificate Component
const VerifyCertificate = () => {
  const [certNumber, setCertNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const verifyCertificate = async () => {
    if (!certNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a certificate number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.rpc('verify_certificate', {
        cert_number: certNumber.trim()
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setVerificationResult(data[0]);
        toast({
          title: "Certificate Verified",
          description: "This certificate is valid!",
        });
      } else {
        setVerificationResult(null);
        toast({
          title: "Certificate Not Found",
          description: "Invalid certificate number or certificate does not exist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Certificate</CardTitle>
        <CardDescription>
          Enter a certificate number to verify its authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter certificate number..."
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && verifyCertificate()}
          />
          <Button onClick={verifyCertificate} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>

        {verificationResult && (
          <div className="mt-4 p-4 border rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800">✓ Certificate Verified</h3>
            <div className="mt-2 space-y-1 text-sm text-green-700">
              <p><strong>Student:</strong> {verificationResult.student_name}</p>
              <p><strong>Course:</strong> {verificationResult.course_title}</p>
              <p><strong>Issue Date:</strong> {new Date(verificationResult.issue_date).toLocaleDateString()}</p>
              <p><strong>Verification Code:</strong> {verificationResult.verification_code}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};