
import { toast as sonnerToast } from "sonner";

export function toast(props: any) {
  const { title, description, variant, ...rest } = props;
  
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
    toast
  };
};
