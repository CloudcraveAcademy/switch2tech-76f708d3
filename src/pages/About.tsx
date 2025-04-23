
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-[#03045E] mb-8">About Switch2Tech Academy</h1>
        
        <div className="space-y-8">
          <section className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Switch2Tech Academy is a premier online learning platform dedicated to helping individuals transition into the tech industry. We provide comprehensive courses, mentorship, and hands-on projects to ensure our students succeed in their tech careers.
            </p>
            
            <h2 className="text-2xl font-semibold text-[#03045E] mt-8 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Our mission is to make quality tech education accessible to everyone, regardless of their background. We believe in practical, project-based learning that prepares students for real-world challenges in the tech industry.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-[#0077B6] text-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-3">What We Offer</h3>
                <ul className="space-y-2">
                  <li>• Expert-led video courses</li>
                  <li>• Hands-on coding projects</li>
                  <li>• One-on-one mentorship</li>
                  <li>• Career guidance</li>
                  <li>• Industry-recognized certifications</li>
                </ul>
              </div>
              
              <div className="bg-[#0077B6] text-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-3">Why Choose Us</h3>
                <ul className="space-y-2">
                  <li>• Industry-relevant curriculum</li>
                  <li>• Flexible learning schedule</li>
                  <li>• Project-based learning</li>
                  <li>• Job placement assistance</li>
                  <li>• Supportive community</li>
                </ul>
              </div>
            </div>
          </section>
          
          <div className="text-center py-8">
            <h3 className="text-2xl font-semibold text-[#03045E] mb-4">Ready to Start Your Tech Journey?</h3>
            <div className="space-x-4">
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
