
import Layout from "@/components/Layout";

const RefundPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
            <p className="mb-4">
              We offer a 30-day money-back guarantee for all our courses. If you're unsatisfied 
              with your purchase, you can request a full refund within 30 days of the purchase date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How to Request a Refund</h2>
            <p className="mb-4">
              To request a refund:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact our support team</li>
              <li>Provide your order number</li>
              <li>Explain your reason for the refund</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Processing Time</h2>
            <p className="mb-4">
              Refunds are typically processed within 5-7 business days of approval.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
