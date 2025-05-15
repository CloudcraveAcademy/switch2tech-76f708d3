
// Import types from toast component
import { type ToastActionElement, ToastProps } from "@/components/ui/toast";
import { toast as toastSonner } from "sonner";

type ToastPropsCustom = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: ToastActionElement;
};

// Create toast function with our custom interface
const toast = ({ ...props }: ToastPropsCustom) => {
  if (props.variant === "destructive") {
    return toastSonner.error(props.title, {
      description: props.description,
      action: props.action
    });
  }
  
  return toastSonner(props.title, {
    description: props.description,
    action: props.action
  });
};

export { toast, toast as useToast };
