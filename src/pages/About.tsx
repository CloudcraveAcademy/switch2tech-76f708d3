
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Users, Rocket, Heart, GraduationCap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-[#03045E] mb-8">About Switch2Tech</h1>
        
        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-[#03045E] mb-4">
              Empowering Ambitious Individuals to Transition into Tech with Confidence
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Switch2Tech is a career-transforming platform designed to help beginners, non-tech professionals, and aspiring technologists acquire the practical, in-demand skills needed to thrive in today's global digital economy.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We provide high-quality training, mentorship, and project-based learning programs that equip learners with the technical competence, industry exposure, and confidence required to build meaningful careers in technology.
            </p>
          </section>

          {/* Train-Thrive-Give Back Model */}
          <section>
            <h2 className="text-2xl font-semibold text-[#03045E] mb-6">
              A Unique Train–Thrive–Give Back Model
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At the heart of Switch2Tech is a powerful, sustainable talent development cycle:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#0077B6] text-white p-6 rounded-lg">
                <GraduationCap className="h-8 w-8 mb-3" />
                <h3 className="text-xl font-semibold text-white mb-3">We Train You</h3>
                <p className="text-white/90">
                  Learners receive structured, industry-led training in Software Engineering, Cloud Computing, Cybersecurity, Data, AI, Product, and more.
                </p>
              </div>
              
              <div className="bg-[#0077B6] text-white p-6 rounded-lg">
                <Rocket className="h-8 w-8 mb-3" />
                <h3 className="text-xl font-semibold text-white mb-3">You Thrive</h3>
                <p className="text-white/90">
                  As students gain competence, complete projects, and secure internships or jobs, they begin to excel in real-world technical roles.
                </p>
              </div>
              
              <div className="bg-[#0077B6] text-white p-6 rounded-lg">
                <Heart className="h-8 w-8 mb-3" />
                <h3 className="text-xl font-semibold text-white mb-3">You Give Back</h3>
                <p className="text-white/90">
                  Those who advance in their careers return as mentors, facilitators, or project reviewers—helping to guide and train the next generation of learners.
                </p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              This continuous cycle allows us to build a strong, supportive community where every success story fuels the growth of others. It creates a self-sustaining ecosystem of trained talent who contribute to elevating the broader tech community.
            </p>
          </section>

          {/* Industry-Led Training */}
          <section>
            <h2 className="text-2xl font-semibold text-[#03045E] mb-4">
              Industry-Led Training Built for Real-World Success
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our curriculum is developed and delivered by professionals with hands-on experience across leading global tech organizations.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We blend practical exercises, real projects, cloud labs, and modern digital tools to ensure every learner acquires skills aligned with real industry demands.
            </p>
          </section>

          {/* Community Focus */}
          <section>
            <h2 className="text-2xl font-semibold text-[#03045E] mb-4">
              A Community Focused on Growth, Innovation & Opportunity
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Switch2Tech is more than a learning platform—it is a movement.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              A collaborative environment where mentors, experts, and learners support one another through peer learning, workshops, hack sessions, internships, and career guidance that accelerates growth.
            </p>
          </section>

          {/* Mission */}
          <section className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8" />
              <h2 className="text-2xl font-semibold">Building the Next Generation of Tech Talent</h2>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Our mission is to close the digital skills gap by providing accessible, practical, and industry-relevant training.
            </p>
            <p className="text-lg leading-relaxed">
              Through our cyclical training model, we empower emerging talent and create an environment where success is shared, scalable, and impactful across Africa, the UK, and globally.
            </p>
          </section>
          
          {/* CTA */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-semibold text-[#03045E] mb-4">Ready to Start Your Tech Journey?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/courses">
                <Button className="bg-[#0077B6] hover:bg-[#03045E]">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-[#0077B6] text-[#0077B6] hover:bg-[#00B4D8]/10">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
