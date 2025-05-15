
// Explicitly import types from toast component
import { type ToastActionElement, ToastProps } from "@/components/ui/toast";

// Import the toast functionality from the Toaster component
import { useToast as useToastOriginal } from "@/components/ui/toaster";

// Create toast function
const toast = ({ ...props }: ToastProps & { action?: ToastActionElement }) => {
  const { toast } = useToastOriginal();
  return toast(props);
};

// Export with proper types
export { toast, useToastOriginal as useToast };
