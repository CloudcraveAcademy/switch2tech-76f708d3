import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentSuccessStory {
  id: string;
  name: string;
  story: string;
  role: string;
  company: string;
  image_url?: string;
  video_url?: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export const useStudentSuccessStories = () => {
  return useQuery({
    queryKey: ["student-success-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_success_stories")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as StudentSuccessStory[];
    },
  });
};