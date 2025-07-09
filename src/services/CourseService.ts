
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/Course";

export class CourseService {
  static async getCourseById(id: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }

    return data;
  }

  static async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }

    return data || [];
  }
}
