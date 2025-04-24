import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    // If today, show "Today at HH:MM AM/PM"
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    
    // If yesterday, show "Yesterday at HH:MM AM/PM"
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }
    
    // If within the last week, show "X days ago"
    const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise, show the full date
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatCurrency(amount: number, currency: string = "NGN"): string {
  if (typeof amount !== 'number') return "N/A";
  
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${amount}`;
  }
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateTimeToComplete(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "N/A";
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}
