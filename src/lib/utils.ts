import { formatDistanceToNow } from "date-fns";

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDistanceToNow(date: Date): string {
    return `${formatDistanceToNow(date, {
        addSuffix: true,
    })}`
}

/**
 * Formats duration in minutes to a human-readable string
 * @param minutes Duration in minutes
 */
export function calculateTimeToComplete(minutes: number): string {
  if (!minutes) return 'N/A';
  
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}`;
}
