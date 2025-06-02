
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CertificateVerification from "@/components/dashboard/student/CertificateVerification";
import Layout from "@/components/Layout";

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const [initialCertNumber, setInitialCertNumber] = useState("");

  useEffect(() => {
    const cert = searchParams.get('cert');
    if (cert) {
      setInitialCertNumber(cert);
    }
  }, [searchParams]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <CertificateVerification initialCertNumber={initialCertNumber} />
        </div>
      </div>
    </Layout>
  );
};

export default VerifyCertificate;
