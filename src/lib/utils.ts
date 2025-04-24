
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid, formatDistanceToNow } from "date-fns"

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

export function formatDateTime(dateString: string): string {
  try {
    if (!dateString) return "N/A";
    
    const date = parseISO(dateString);
    
    if (!isValid(date)) return "Invalid date";
    
    return format(date, 'MMM dd, yyyy - h:mm a');
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "Invalid date";
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    if (!dateString) return "N/A";
    
    const date = parseISO(dateString);
    
    if (!isValid(date)) return "Invalid date";
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid date";
  }
}

export function formatCurrency(amount: number, currency: string = "NGN"): string {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${amount}`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
