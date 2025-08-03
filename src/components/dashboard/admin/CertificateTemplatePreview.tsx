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
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 relative">
      <CardContent className="p-6 relative">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-3">
            <img 
              src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" 
              alt="Switch2Tech" 
              className="h-10 w-auto mr-3" 
            />
            <div className="text-left">
              <span className="text-xl font-bold text-brand-700">Switch2Tech</span>
            </div>
          </div>
          <div className="flex justify-center mb-3">
            <Award className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-6 px-4">
          <p className="text-base text-gray-600 mb-1">This is to certify that</p>
          
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2 inline-block max-w-full break-words">
            {studentName}
          </h2>
          
          <p className="text-base text-gray-600 mb-3">has successfully completed the course</p>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-4 max-w-full break-words px-2">
            {courseName}
          </h3>
          
          <p className="text-base text-gray-600 mb-4 max-w-full break-words">
            under the instruction of <span className="font-semibold text-gray-800">{instructorName}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-3 gap-4 items-end px-4">
          <div className="text-left">
            <p className="text-sm text-gray-600 mb-1">Issue Date</p>
            <p className="text-base font-semibold text-gray-800 break-words">{issueDate}</p>
          </div>
          
          <div className="text-center">
            <div className="w-32 border-t-2 border-gray-400 mb-2 mx-auto"></div>
            <p className="text-sm text-gray-600 font-semibold">Mr. Issa Ajao</p>
            <p className="text-xs text-gray-500">Chief Platform Administrator</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              <img 
                src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" 
                alt="Switch2Tech" 
                className="h-3 w-auto mr-1" 
              />
              <Badge variant="outline" className="text-xs">
                Certificate #{certificateNumber}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 break-all">
              Verification: {verificationCode}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-4 border-t-4 border-blue-300"></div>
        <div className="absolute top-3 right-3 w-6 h-6 border-r-4 border-t-4 border-blue-300"></div>
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-4 border-b-4 border-blue-300"></div>
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-4 border-b-4 border-blue-300"></div>
      </CardContent>
    </Card>
  );
};

export default CertificateTemplatePreview;
