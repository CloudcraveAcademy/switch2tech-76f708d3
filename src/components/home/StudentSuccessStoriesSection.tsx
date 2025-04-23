
import { User, Quote, Award, Briefcase } from "lucide-react";

const testimonials = [
  {
    name: "John Doe",
    story: "I transitioned from retail to a tech career in just 6 months! The hands-on projects and personalized mentorship were game-changers for my career path.",
    role: "Software Engineer",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
  },
  {
    name: "Jane Smith",
    story: "The mentorship program helped me land my dream job at a top tech company. The industry-relevant curriculum gave me exactly what I needed to succeed.",
    role: "Data Scientist",
    company: "DataViz Inc",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
  },
  {
    name: "Mike Johnson",
    story: "Switch2Tech's practical approach gave me the skills I needed to succeed. I went from zero coding knowledge to leading a development team in just one year.",
    role: "Cloud Engineer",
    company: "CloudNine",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80"
  }
];

const StudentSuccessStoriesSection = () => {
  return (
    <section className="py-24 bg-section-light">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-section-navy">Student Success Stories</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Real stories from real students who transformed their careers with our guidance
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 to-transparent" />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4 text-brand">
                  <Quote className="h-6 w-6" />
                </div>
                <blockquote className="text-foreground mb-6 flex-grow italic">
                  "{testimonial.story}"
                </blockquote>
                
                <div className="flex items-center border-t border-border pt-4">
                  <div className="mr-4">
                    <User className="h-10 w-10 p-2 bg-brand/10 text-brand rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{testimonial.role}</span>
                      <span className="mx-1">•</span>
                      <span>{testimonial.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full">
            <Award className="h-5 w-5" />
            <span className="font-medium">Join 1,000+ successful career changers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentSuccessStoriesSection;
