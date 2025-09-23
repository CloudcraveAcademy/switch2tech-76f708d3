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
  student_name?: string;
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
            id,
            title,
            image_url,
            instructor_id
          ),
          student:user_profiles!student_id (
            first_name,
            last_name
          )
        `)
        .eq('student_id', user.id)
        .order('issue_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }
      
      // Fetch instructor profiles separately  
      const courseIds = data?.map(cert => cert.course?.id).filter(Boolean) || [];
      let instructors: any[] = [];
      
      if (courseIds.length > 0) {
        const { data: coursesWithInstructors } = await supabase
          .from('courses')
          .select(`
            id,
            instructor_id,
            instructor:user_profiles!instructor_id (
              first_name,
              last_name
            )
          `)
          .in('id', courseIds);
          
        instructors = coursesWithInstructors || [];
      }

      return data?.map(cert => {
        const courseInstructor = instructors.find(inst => inst.id === cert.course?.id);
        
        return {
          ...cert,
          course: cert.course ? {
            title: cert.course.title,
            instructor_name: courseInstructor?.instructor ? 
              `${courseInstructor.instructor.first_name || ''} ${courseInstructor.instructor.last_name || ''}`.trim() : 
              'Unknown Instructor',
            image_url: cert.course.image_url
          } : undefined,
          student_name: cert.student ? 
            `${cert.student.first_name || ''} ${cert.student.last_name || ''}`.trim() : 
            'Unknown Student'
        };
      }) || [];
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