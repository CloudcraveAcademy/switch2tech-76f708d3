
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

const FeaturedCoursesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Courses</h2>
        <p className="text-center text-muted-foreground mb-8">
          Explore our most popular courses designed to help you build practical skills and advance your career.
        </p>
        <div className="flex justify-center">
          <Button>View All Courses</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
