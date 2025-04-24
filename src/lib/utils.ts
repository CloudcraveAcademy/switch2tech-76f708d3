
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    if (!dateString) return "N/A";
    
    const date = parseISO(dateString);
    
    if (!isValid(date)) return "Invalid date";
    
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}
