
import { Book } from "lucide-react";

const categories = [
  "Web Development",
  "Data Science",
  "Cloud Computing",
  "Cybersecurity",
  "AI & Machine Learning",
  "Mobile Development",
];

const ExploreCategoriesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Explore By Categories</h2>
        <p className="text-center text-muted-foreground mb-8">
          Find the perfect course by exploring our diverse range of tech categories.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-background p-6 rounded-lg shadow-sm text-center hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-center mb-4">
                <Book className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{category}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategoriesSection;
