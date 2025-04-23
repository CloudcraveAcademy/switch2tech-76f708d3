import { Code, Shield, Database, Cloud, Smartphone, ArrowRight, Layers, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Web Development",
    description: "Learn to build modern, responsive websites and web applications",
    icon: Code,
    courses: 24
  },
  {
    name: "Testing",
    description: "Master software testing, QA, and test automation",
    icon: Layers,
    courses: 18
  },
  {
    name: "Cybersecurity",
    description: "Protect systems and networks from digital attacks",
    icon: Shield,
    courses: 15
  },
  {
    name: "DevOps",
    description: "Combine software development and IT operations",
    icon: Layers,
    courses: 12
  },
  {
    name: "UI/UX Design",
    description: "Create beautiful, intuitive user interfaces and experiences",
    icon: PenTool,
    courses: 10
  },
  {
    name: "Mobile Development",
    description: "Build native and cross-platform mobile applications",
    icon: Smartphone,
    courses: 14
  },
  {
    name: "Data Science",
    description: "Extract insights and knowledge from data",
    icon: Database,
    courses: 20
  },
  {
    name: "Cloud Computing",
    description: "Master cloud platforms, services, and infrastructure",
    icon: Cloud,
    courses: 16
  },
];

const ExploreCategoriesSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
          Explore By Categories
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Find the perfect course by exploring our diverse range of tech categories.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.name} 
              className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <div className="flex justify-start mb-6">
                <category.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {category.name}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-brand font-medium">
                  {category.courses} courses
                </span>
                <Link 
                  to="/courses" 
                  className="text-brand hover:text-brand-dark flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  View Courses 
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategoriesSection;
