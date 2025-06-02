
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VerificationResult {
  certificate_id: string;
  student_name: string;
  course_title: string;
  issue_date: string;
  verification_code: string;
}

interface CertificateVerificationProps {
  initialCertNumber?: string;
}

const CertificateVerification = ({ initialCertNumber = "" }: CertificateVerificationProps) => {
  const [verificationNumber, setVerificationNumber] = useState(initialCertNumber);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (certNumber: string) => {
      const { data, error } = await supabase
        .rpc('verify_certificate', { cert_number: certNumber });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const result = data[0] || null;
      setVerificationResult(result);
      setIsVerified(!!result);
    },
    onError: () => {
      setVerificationResult(null);
      setIsVerified(false);
    },
  });

  // Auto-verify if initial cert number is provided
  useEffect(() => {
    if (initialCertNumber && initialCertNumber.trim()) {
      verifyMutation.mutate(initialCertNumber.trim());
    }
  }, [initialCertNumber]);

  const handleVerify = () => {
    if (verificationNumber.trim()) {
      verifyMutation.mutate(verificationNumber.trim());
    }
  };

  const resetVerification = () => {
    setVerificationNumber("");
    setVerificationResult(null);
    setIsVerified(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
        <p className="text-gray-600">
          Verify the authenticity of certificates issued by our platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Verify Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter certificate number or verification code"
              value={verificationNumber}
              onChange={(e) => setVerificationNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button 
              onClick={handleVerify}
              disabled={verifyMutation.isPending || !verificationNumber.trim()}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
          </div>

          {isVerified !== null && (
            <div className="mt-6">
              {isVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600 mb-4">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    <span className="text-lg font-semibold">Certificate Verified ✓</span>
                  </div>
                  
                  {verificationResult && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Student Name</label>
                            <p className="text-lg font-semibold">{verificationResult.student_name}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Course</label>
                            <p className="text-lg font-semibold">{verificationResult.course_title}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Issue Date</label>
                            <p className="text-lg font-semibold">{formatDate(verificationResult.issue_date)}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Verification Code</label>
                            <p className="text-lg font-mono bg-white px-2 py-1 rounded border">
                              {verificationResult.verification_code}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Authentic Certificate
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Certificate Not Found</h3>
                  <p className="text-gray-600 mb-4">
                    No certificate found with the provided number or verification code.
                  </p>
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Invalid Certificate
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={resetVerification}>
                  Verify Another Certificate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to verify a certificate:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enter the certificate number (e.g., CERT-ABC12345)</li>
            <li>• Or enter the verification code found on the certificate</li>
            <li>• Click "Verify" to check authenticity</li>
            <li>• Valid certificates will show student and course details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateVerification;
