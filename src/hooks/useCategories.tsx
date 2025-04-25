
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories from Supabase...');
      
      try {
        const { data, error } = await supabase
          .from('course_categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }
        
        console.log('Raw categories data returned from Supabase:', data);
        
        if (!data || data.length === 0) {
          console.log('No categories found in the database');
          return [];
        }
        
        // Map data to ensure it conforms to our Category interface
        const formattedCategories: Category[] = data.map(cat => ({
          id: cat.id || '',
          name: cat.name || '',
          description: cat.description || '',
          icon: cat.icon || 'folder' // Default icon if none provided
        }));
        
        console.log('Formatted categories:', formattedCategories);
        return formattedCategories;
      } catch (err) {
        console.error('Exception in categories fetch:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 60000, // Cache data for 1 minute
  });
}
