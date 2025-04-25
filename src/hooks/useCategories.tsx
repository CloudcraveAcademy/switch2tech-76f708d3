
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  count?: number;  // Adding count field to hold number of courses
}

// Define fallback categories for use when database fetch fails
const fallbackCategories: Category[] = [
  {
    id: "1",
    name: "Web Development",
    description: "Learn to build modern, responsive websites and web applications",
    icon: "code",
    count: 45  // Sample count data for fallback categories
  },
  {
    id: "2",
    name: "Data Science",
    description: "Master data analysis, visualization and machine learning",
    icon: "database",
    count: 28
  },
  {
    id: "3",
    name: "Mobile Development",
    description: "Create native and cross-platform mobile applications",
    icon: "smartphone",
    count: 32
  },
  {
    id: "4",
    name: "Cloud Computing",
    description: "Deploy and manage applications in the cloud",
    icon: "cloud",
    count: 20
  },
];

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories from Supabase...');
      
      try {
        // First get the categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('course_categories')
          .select('*')
          .order('name');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }
        
        if (!categoriesData || categoriesData.length === 0) {
          console.log('No categories found in the database, returning fallback categories');
          return fallbackCategories;
        }

        // Get course counts for each category
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('category, count')
          .not('category', 'is', null)
          .group('category');
        
        if (coursesError) {
          console.error('Error fetching course counts:', coursesError);
          // Continue with processing categories, even without counts
        }
        
        // Create a map of category IDs to course counts
        const countMap: {[key: string]: number} = {};
        if (coursesData && coursesData.length > 0) {
          coursesData.forEach(item => {
            if (item.category) {
              countMap[item.category] = parseInt(item.count);
            }
          });
        }
        
        console.log('Raw categories data:', categoriesData);
        console.log('Course counts:', countMap);
        
        // Map data to ensure it conforms to our Category interface
        const formattedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id || '',
          name: cat.name || '',
          description: cat.description || '',
          icon: cat.icon || 'folder', // Default icon if none provided
          count: countMap[cat.id] || 0 // Add the count from our map, default to 0
        }));
        
        console.log('Formatted categories:', formattedCategories);
        return formattedCategories;
      } catch (err) {
        console.error('Exception in categories fetch:', err);
        console.log('Returning fallback categories due to error');
        return fallbackCategories;
      }
    },
    retry: 1,
    staleTime: 60000, // Cache data for 1 minute
  });
}
