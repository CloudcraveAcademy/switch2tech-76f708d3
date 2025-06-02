
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface CertificateTemplatePreviewProps {
  studentName?: string;
  courseName?: string;
  instructorName?: string;
  issueDate?: string;
  certificateNumber?: string;
  verificationCode?: string;
}

const CertificateTemplatePreview: React.FC<CertificateTemplatePreviewProps> = ({
  studentName = "John Doe",
  courseName = "Sample Course Title",
  instructorName = "Jane Smith",
  issueDate = "June 2, 2025",
  certificateNumber = "CERT-12345678",
  verificationCode = "ABCD1234EFGH"
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
      <CardContent className="p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
          <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-6">This is to certify that</p>
          
          <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2 inline-block">
            {studentName}
          </h2>
          
          <p className="text-lg text-gray-600 mb-4">has successfully completed the course</p>
          
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            {courseName}
          </h3>
          
          <p className="text-lg text-gray-600 mb-8">
            under the instruction of <span className="font-semibold text-gray-800">{instructorName}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-left">
            <p className="text-sm text-gray-600 mb-1">Issue Date</p>
            <p className="text-lg font-semibold text-gray-800">{issueDate}</p>
          </div>
          
          <div className="text-center">
            <div className="w-48 border-t-2 border-gray-400 mb-2"></div>
            <p className="text-sm text-gray-600">Platform Administrator</p>
          </div>
          
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              Certificate #{certificateNumber}
            </Badge>
            <p className="text-xs text-gray-500">
              Verification: {verificationCode}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-300"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-300"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-300"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-300"></div>
      </CardContent>
    </Card>
  );
};

export default CertificateTemplatePreview;
