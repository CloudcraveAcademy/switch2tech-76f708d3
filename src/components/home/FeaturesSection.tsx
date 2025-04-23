import { Book, Users, Briefcase, Medal } from "lucide-react";

const features = [
  {
    icon: <Book className="h-6 w-6" />,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with real-world experience"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Mentorship Programs",
    description: "Get personalized guidance from experienced mentors"
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Internship Opportunities",
    description: "Gain practical experience with leading companies"
  },
  {
    icon: <Medal className="h-6 w-6" />,
    title: "Certifications",
    description: "Earn recognized certificates upon course completion"
  }
];

const FeaturesSection = () => {
  return (
    <div className="py-24 bg-section-light">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-section-navy text-center mb-12">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
