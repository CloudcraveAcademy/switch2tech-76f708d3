
import { toast as sonnerToast } from "sonner";
import type { ToastPropsCustom } from "@/components/ui/toast";

// This is a wrapper around sonner's toast function
export const toast = ({ ...props }: ToastPropsCustom) => {
  return sonnerToast[props.variant || "default"]({
    title: props.title,
    description: props.description,
    duration: props.duration,
    dismissible: true,
  });
};

// For compatibility with shadcn toast pattern
export const useToast = () => {
  return {
    toast,
    toasts: [] // Add empty toasts array for compatibility
  };
};
