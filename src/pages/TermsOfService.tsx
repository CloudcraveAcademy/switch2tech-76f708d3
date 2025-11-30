
import Layout from "@/components/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">TERMS OF USE (Switch2Tech)</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">Last updated: 1st July 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using the Switch2Tech website, training programs, or mentorship community, you agree to comply with these Terms of Use ("Terms"). If you do not agree, please discontinue use of the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-2">To use our platform, you must:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Be at least 16 years old</li>
              <li>Provide accurate information during registration</li>
              <li>Use the platform only for lawful and educational purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Use of the Platform</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use Switch2Tech for personal learning and professional development only</li>
              <li>Not share or transfer your account or login information</li>
              <li>Not copy, distribute, or reproduce any platform materials without permission</li>
              <li>Not attempt to disrupt the platform or compromise security</li>
              <li>Not impersonate others or provide misleading information</li>
            </ul>
            <p className="mb-4">We reserve the right to suspend or remove users who violate these terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              All content on Switch2Tech—including training materials, documents, videos, text, graphics, and branding—is our intellectual property.
            </p>
            <p className="mb-2">You may not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Reproduce, copy, distribute, or publicly share any materials</li>
              <li>Use Switch2Tech content for commercial or teaching purposes outside the platform</li>
              <li>Modify or create derivative works based on our content</li>
            </ul>
            <p className="mb-4">You receive a personal, limited license to access the materials while enrolled.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Mentorship & Learning Disclaimer</h2>
            <p className="mb-2">Our training and mentorship programs are designed to support your development and enhance your skills, but:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>We do not guarantee specific outcomes</li>
              <li>We do not promise employment or placements</li>
              <li>Progress depends on your participation, effort, and learning commitment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Community & Behaviour Guidelines</h2>
            <p className="mb-4">
              All learners and mentors must maintain professional and respectful conduct.
            </p>
            <p className="mb-2">This includes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>No harassment, abuse, bullying, or discrimination</li>
              <li>No offensive, harmful, or inappropriate behaviour</li>
              <li>Respectful engagement during sessions, discussions, and mentorship interactions</li>
            </ul>
            <p className="mb-4">Violation of these rules may result in account restrictions or removal.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p className="mb-4">
              We may integrate with third-party tools (for communication, storage, analytics, etc.).
              We are not responsible for the policies or actions of these third-party providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Platform Modifications</h2>
            <p className="mb-4">
              We may update, enhance, or modify features of the platform at any time to improve the user experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination of Access</h2>
            <p className="mb-2">We may suspend or terminate your account if:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>You violate these Terms</li>
              <li>You engage in inappropriate behaviour</li>
              <li>You misuse resources or content</li>
            </ul>
            <p className="mb-4">You may also request account deletion at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
            <p className="mb-4">
              We may amend these Terms from time to time. Continued use of the platform after changes means you accept the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="mb-2">For questions about these Terms of Use, contact us at:</p>
            <p className="mb-1">Email: <a href="mailto:info@switch2tech.net" className="text-primary hover:underline">info@switch2tech.net</a></p>
            <p className="mb-4">Website: <a href="https://www.switch2tech.net" className="text-primary hover:underline">www.switch2tech.net</a></p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
