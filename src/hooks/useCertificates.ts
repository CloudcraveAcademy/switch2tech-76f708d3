import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  issue_date: string;
  certificate_number: string;
  verification_code: string;
  pdf_url?: string;
  course?: {
    title: string;
    instructor_name: string;
    image_url?: string;
  };
}

export const useCertificates = () => {
  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses (
            title,
            image_url,
            instructor:user_profiles_public!instructor_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('student_id', user.id)
        .order('issue_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }
      
      return data?.map(cert => ({
        ...cert,
        course: cert.course ? {
          title: cert.course.title,
          instructor_name: `${cert.course.instructor?.first_name || ''} ${cert.course.instructor?.last_name || ''}`.trim(),
          image_url: cert.course.image_url
        } : undefined
      })) || [];
    },
    enabled: !!user,
  });

  const certificateCount = certificates?.length || 0;

  return {
    certificates,
    certificateCount,
    isLoading,
  };
};