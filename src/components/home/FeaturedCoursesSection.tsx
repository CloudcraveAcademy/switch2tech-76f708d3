
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getFeaturedCourses } from "@/utils/mockData";
import CourseCard from "@/components/CourseCard";

const FeaturedCoursesSection = () => {
  const featuredCourses = getFeaturedCourses().slice(0, 3); // Get first 3 featured courses

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
            Featured Courses
          </h2>
          <p className="text-xl text-muted-foreground">
            Explore our most popular courses designed to help you build practical skills 
            and advance your career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/courses">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
              View All Courses
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="shadow-sm hover:shadow-md transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
