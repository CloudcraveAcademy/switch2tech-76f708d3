
import { User, GraduationCap, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: <User className="h-12 w-12 text-primary" />,
    title: "Assessment",
    description: "Understand your current skills and career goals."
  },
  {
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
    title: "Personalized Learning",
    description: "Follow a tailored learning path with expert-led courses."
  },
  {
    icon: <Lightbulb className="h-12 w-12 text-primary" />,
    title: "Mentorship & Projects",
    description: "Get guidance from industry professionals and build real-world projects."
  }
];

const HowSwitchToTechWorksSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How Switch2Tech Works</h2>
        <p className="text-center text-muted-foreground mb-8">
          Our unique approach combines learning, mentorship, and real-world experience to ensure your successful transition into tech.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-brand-dark backdrop-blur-sm p-6 rounded-lg shadow-sm text-center text-white border border-border"
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-white/80">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowSwitchToTechWorksSection;
