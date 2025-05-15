import { Code, Shield, Database, Cloud, Smartphone, ArrowRight, Settings, PenTool, BookOpen, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories, Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Create a mapping of icon strings to Lucide icon components
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
  const { data: categories = [], isLoading, error } = useCategories();
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Couldn't load categories",
        description: "Using default categories instead",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Explore By Categories
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Find the perfect course by exploring our diverse range of tech categories.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Extract category card rendering to a separate component
const CategoryCard = ({ category }: { category: Category }) => {
  // Get the icon component from our icon map or default to Folder
  const IconComponent = iconMap[category.icon] || Folder;
  
  return (
    <Card className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
          {category.count || 0} courses
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        {category.name}
      </h3>
      <p className="text-muted-foreground mb-6 text-sm flex-grow">
        {category.description}
      </p>
      <div className="mt-auto">
        <Link 
          to={`/courses?category=${category.id}`}
          className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          View Courses 
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
};

export default ExploreCategoriesSection;
