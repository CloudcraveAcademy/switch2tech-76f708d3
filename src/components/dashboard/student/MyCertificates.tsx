import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen } from "lucide-react";
import { useCertificates } from "@/hooks/useCertificates";
import CertificateCard from "./CertificateCard";

const MyCertificates = () => {
  const { certificates, certificateCount, isLoading } = useCertificates();

  if (isLoading) {
    return <div>Loading certificates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-amber-500" />
          <span>{certificateCount} Certificate{certificateCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {certificateCount === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No certificates yet</h3>
            <p className="text-gray-500 text-center mb-6">
              Complete courses to earn certificates and showcase your achievements
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates?.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;