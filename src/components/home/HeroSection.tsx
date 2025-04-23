
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative min-h-[600px] flex items-center bg-gradient-to-br from-background via-brand/5 to-brand-dark/10">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="container mx-auto px-6 relative">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text text-transparent">
            Unlock Your Potential with Expert-Led Courses
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Access high-quality courses, mentorship programs, and internship opportunities 
            to accelerate your career growth.
          </p>
          <div className="flex gap-4 items-center">
            <Link to="/courses">
              <Button size="lg" className="bg-brand hover:bg-brand-dark text-white shadow-lg hover:shadow-xl transition-all group">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-brand text-brand hover:bg-brand/10 shadow-sm hover:shadow-md transition-all">
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
