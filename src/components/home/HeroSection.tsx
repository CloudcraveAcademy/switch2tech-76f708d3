import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative min-h-[600px] flex items-center bg-brand-dark w-full overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 w-full bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')] 
        bg-cover bg-center bg-no-repeat opacity-10"
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold mb-6 text-white">
            Unlock Your Potential with Expert-Led Courses
          </h1>
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Access high-quality courses, mentorship programs, and internship opportunities 
            to accelerate your career growth.
          </p>
          <div className="flex gap-4 items-center">
            <Link to="/courses">
              <Button size="lg" className="bg-brand hover:bg-brand/90 text-white shadow-lg hover:shadow-xl transition-all group">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-dark shadow-sm hover:shadow-md transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
