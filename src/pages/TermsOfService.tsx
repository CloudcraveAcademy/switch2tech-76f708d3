
import Layout from "@/components/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Switch2Tech Academy, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account 
              and password. You agree to accept responsibility for all activities that 
              occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
            <p className="mb-4">
              All content on Switch2Tech Academy, including courses, materials, and resources, 
              is protected by copyright and other intellectual property rights.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
