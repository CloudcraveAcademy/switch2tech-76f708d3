
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

// Fallback categories to use if none are loaded from database
const fallbackCategories: Category[] = [
  {
    id: "1",
    name: "Web Development",
    description: "Learn to build modern, responsive websites and web applications",
    icon: "code"
  },
  {
    id: "2",
    name: "Data Science",
    description: "Master data analysis, visualization and machine learning",
    icon: "database"
  },
  {
    id: "3",
    name: "Mobile Development",
    description: "Create native and cross-platform mobile applications",
    icon: "smartphone"
  },
  {
    id: "4",
    name: "Cloud Computing",
    description: "Deploy and manage applications in the cloud",
    icon: "cloud"
  },
];

const ExploreCategoriesSection = () => {
  const { data: fetchedCategories, isLoading, error } = useCategories();
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const { toast } = useToast();
  
  // Effect to handle category data once loaded
  useEffect(() => {
    console.log('Categories useEffect running with data:', fetchedCategories);
    
    if (fetchedCategories && Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
      console.log('Setting categories from API:', fetchedCategories);
      setCategories(fetchedCategories);
    } else if (!isLoading && error) {
      console.log('Error fetching categories:', error);
      toast({
        title: "Couldn't load categories",
        description: "Using default categories instead",
        variant: "destructive"
      });
    }
  }, [fetchedCategories, isLoading, error, toast]);

  console.log('Rendering ExploreCategoriesSection with:', { 
    fetchedCategories, 
    isLoading, 
    error, 
    categoriesState: categories 
  });

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
    <Card className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border h-full flex flex-col">
      <div className="flex justify-start mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <IconComponent className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">
        {category.name}
      </h3>
      <p className="text-muted-foreground mb-6 text-sm flex-grow">
        {category.description}
      </p>
      <div className="mt-auto pt-4">
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
