
import { Code, Shield, Database, Cloud, Smartphone, ArrowRight, Settings, PenTool, BookOpen, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories, Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

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
  
  // Effect to handle category data once loaded
  useEffect(() => {
    console.log('Categories useEffect running with data:', fetchedCategories);
    
    if (fetchedCategories && Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
      console.log('Setting categories from API:', fetchedCategories);
      setCategories(fetchedCategories);
    } else if (!isLoading && !error) {
      console.log('No valid categories from API, using fallbacks');
      setCategories(fallbackCategories);
    }
  }, [fetchedCategories, isLoading, error]);

  console.log('Rendering ExploreCategoriesSection with:', { 
    fetchedCategories, 
    isLoading, 
    error, 
    categoriesState: categories 
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
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
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Extract category card rendering to a separate component
function CategoryCard({ category }: { category: Category }) {
  // Default to the Folder icon if the specified icon is not found
  const IconComponent = iconMap[category.icon] || Folder;
  
  return (
    <Card 
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
    </Card>
  );
}

export default ExploreCategoriesSection;
