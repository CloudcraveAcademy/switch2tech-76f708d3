
import { toast as sonnerToast } from "sonner";

// Track toast objects for compatibility with shadcn/ui toast
type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

let toasts: Toast[] = [];

export function toast(props: any) {
  const { title, description, variant, ...rest } = props;
  
  // Create a unique ID for this toast
  const id = Math.random().toString(36).substring(2, 9);
  
  // Add to our tracked toasts
  const newToast = { id, title, description, variant, ...rest };
  toasts = [...toasts, newToast];
  
  // Use sonner toast
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...rest
    });
  } else {
    return sonnerToast(title, {
      description,
      ...rest
    });
  }
}

export const useToast = () => {
  return {
    toast,
    toasts // Return the toasts array for shadcn/ui compatibility
  };
};
