
// Import from the correct location
import { useToast as useToastPrimitive } from "@/components/ui/toaster";
import { toast as toastPrimitive } from "@/components/ui/toast";

// Export with aliases to avoid name conflicts
export const useToast = useToastPrimitive;
export const toast = toastPrimitive;
