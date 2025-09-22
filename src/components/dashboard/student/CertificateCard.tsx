import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, ExternalLink, Award } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { format } from "date-fns";

interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const handleDownload = () => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank');
    } else {
      // Generate PDF if not available
      console.log('Generating certificate PDF...');
    }
  };

  const handleVerify = () => {
    window.open(`/verify-certificate?cert=${certificate.certificate_number}`, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">{certificate.course?.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Certified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Issued {format(new Date(certificate.issue_date), 'MMM dd, yyyy')}</span>
        </div>
        
        {certificate.course?.instructor_name && (
          <p className="text-sm text-muted-foreground">
            Instructor: {certificate.course.instructor_name}
          </p>
        )}
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
          <p className="font-mono text-sm font-medium">{certificate.certificate_number}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleVerify} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Verify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;