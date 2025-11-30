
import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">PRIVACY POLICY (Switch2Tech)</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">Last updated: [Insert date]</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Switch2Tech ("we", "our", "us") is committed to protecting your personal information and maintaining your privacy. This Privacy Policy explains how we collect, use, store, and secure the data you provide when you visit our platform, register for training programs, or participate in mentorship activities.
            </p>
            <p className="mb-4">
              By using our website or services, you agree to the practices outlined in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p className="mb-2">We may collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Location and demographic information</li>
              <li>Educational or professional background (if provided by you)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address</li>
              <li>Device details</li>
              <li>Browser type and version</li>
              <li>Pages visited and duration</li>
              <li>Cookies and tracking information</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Training & Mentorship Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Assignments or projects</li>
              <li>Attendance or participation information</li>
              <li>Feedback or mentor notes (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide access to training programs, mentorship, and platform features</li>
              <li>Communicate updates, schedules, notifications, and support messages</li>
              <li>Improve our course content and platform user experience</li>
              <li>Analyze usage patterns to enhance our services</li>
              <li>Maintain platform security and protect against misuse</li>
            </ul>
            <p className="mb-4 font-semibold">We will never sell your personal information.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
            <p className="mb-2">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Platform tools and service providers (e.g., cloud storage, analytics services)</li>
              <li>Mentors and instructors for training support</li>
              <li>Hiring partners or career networks only with your consent</li>
            </ul>
            <p className="mb-4">All third parties are required to maintain confidentiality and data protection standards.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to safeguard your data, including encryption, access controls, and secure storage systems.
            </p>
            <p className="mb-4">
              While we work continually to protect your information, no digital platform is entirely risk-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-2">Depending on your region, you may have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access the data we hold about you</li>
              <li>Request corrections or updates</li>
              <li>Request deletion of your data</li>
              <li>Restrict or object to certain processing activities</li>
              <li>Opt out of optional communications</li>
            </ul>
            <p className="mb-4">To exercise these rights, contact us at info@switch2tech.net.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="mb-4">
              Cookies help us personalize your experience and understand how you interact with the platform.
              You can disable cookies through your browser settings, though some features may not function fully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your data only as long as necessary for educational delivery, mentorship support, legal requirements, or platform improvement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. New versions will reflect an updated "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="mb-2">For privacy-related inquiries, contact us at:</p>
            <p className="mb-1">Email: <a href="mailto:info@switch2tech.net" className="text-primary hover:underline">info@switch2tech.net</a></p>
            <p className="mb-4">Website: <a href="https://www.switch2tech.net" className="text-primary hover:underline">www.switch2tech.net</a></p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
