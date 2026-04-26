import { GraduationCap, Rocket, Heart } from "lucide-react";

const steps = [
  {
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
    title: "We Train You",
    description: "Learners receive structured, industry-led training in Software Engineering, Cloud Computing, Cybersecurity, Data, AI, Product, and more."
  },
  {
    icon: <Rocket className="h-12 w-12 text-primary" />,
    title: "You Thrive",
    description: "As students gain competence, complete projects, and secure internships or jobs, they begin to excel in real-world technical roles."
  },
  {
    icon: <Heart className="h-12 w-12 text-primary" />,
    title: "You Give Back",
    description: "Those who advance in their careers return as mentors, facilitators, or project reviewers—helping to guide and train the next generation of learners."
  }
];

const HowSwitchToTechWorksSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          A Unique Train–Thrive–Give Back Model
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          At the heart of Switch2Tech is a powerful, sustainable talent development cycle:
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
        <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          This continuous cycle allows us to build a strong, supportive community where every success story fuels the growth of others. It creates a self-sustaining ecosystem of trained talent who contribute to elevating the broader tech community.
        </p>
      </div>
    </section>
  );
};

export default HowSwitchToTechWorksSection;
