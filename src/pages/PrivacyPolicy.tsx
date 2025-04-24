
import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information that you provide directly to us, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Course progress and completion data</li>
              <li>Communications with us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our services</li>
              <li>Process your payments</li>
              <li>Send you updates and marketing communications</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
