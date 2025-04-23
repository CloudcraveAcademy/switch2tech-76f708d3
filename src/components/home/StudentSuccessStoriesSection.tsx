
import { Award } from "lucide-react";

const testimonials = [
  {
    name: "John Doe",
    story: "I transitioned from retail to a tech career in just 6 months!",
    role: "Software Engineer",
  },
  {
    name: "Jane Smith",
    story: "The mentorship program helped me land my dream job at a top tech company.",
    role: "Data Scientist",
  },
  {
    name: "Mike Johnson",
    story: "Switch2Tech's practical approach gave me the skills I needed to succeed.",
    role: "Cloud Engineer",
  }
];

const StudentSuccessStoriesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Student Success Stories</h2>
        <p className="text-center text-muted-foreground mb-8">
          Hear from students who have successfully transformed their careers with Switch2Tech Academy.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-background p-6 rounded-lg shadow-sm text-center"
            >
              <div className="flex justify-center mb-4">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <blockquote className="mb-4 italic">"{testimonial.story}"</blockquote>
              <div>
                <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                <p className="text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentSuccessStoriesSection;
