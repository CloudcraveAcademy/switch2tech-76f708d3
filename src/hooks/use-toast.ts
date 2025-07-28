
import { toast as sonnerToast } from "sonner";

export function toast(props: any) {
  const { title, description, variant, ...rest } = props;
  
  // Use sonner toast directly without tracking
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...rest
    });
  } else {
    return sonnerToast.success(title, {
      description,
      ...rest
    });
  }
}

export const useToast = () => {
  return {
    toast
  };
};
