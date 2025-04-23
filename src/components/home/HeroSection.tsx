
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background min-h-[600px] flex items-center">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-6">
            Unlock Your Potential with Expert-Led Courses
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Access high-quality courses, mentorship programs, and internship opportunities to accelerate your career growth.
          </p>
          <div className="flex gap-4">
            <Link to="/courses">
              <Button size="lg">Explore Courses</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
