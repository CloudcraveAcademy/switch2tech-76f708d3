
import { Code, Shield, Database, Cloud, Smartphone, ArrowRight, Settings, PenTool, BookOpen, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  smartphone: Smartphone,
  settings: Settings,
  "pen-tool": PenTool,
  book: BookOpen,
  folder: Folder,
};

const ExploreCategoriesSection = () => {
  const { data: categories, isLoading, error } = useCategories();

  // Add console logs for debugging
  console.log('Categories data:', categories);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  if (isLoading) {
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading categories:', error);
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load the categories. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Explore By Categories
          </h2>
          <p className="text-muted-foreground mb-6">
            No categories available at the moment. Check back soon!
          </p>
        </div>
      </section>
    );
  }

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
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Code;
            
            return (
              <div 
                key={category.id} 
                className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className="flex justify-start mb-6">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/courses?category=${category.id}`}
                    className="text-brand hover:text-brand-dark flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    View Courses 
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategoriesSection;
