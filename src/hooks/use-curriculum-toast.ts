
import { toast } from "@/hooks/use-toast";

export function useCurriculumToast() {
  return {
    showSuccessToast: (message: string) => {
      toast({
        title: "Success",
        description: message
      });
    },
    
    showErrorToast: (title: string, message: string) => {
      toast({
        title,
        description: message,
        variant: "destructive"
      });
    },
    
    showDebugToast: () => {
      toast({
        title: "Debug",
        description: "Lessons printed to console"
      });
    }
  };
}
