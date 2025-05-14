
// Import the toast-related functions from the correct components
import { useToast as useToastPrimitive } from "@/components/ui/toaster";
import { type ToastActionElement, ToastProps } from "@/components/ui/toast";

// Create toast function
const toast = ({ ...props }: ToastProps & { action?: ToastActionElement }) => {
  const { toast } = useToastPrimitive();
  return toast(props);
};

// Export with proper types
export { toast, useToastPrimitive as useToast };
