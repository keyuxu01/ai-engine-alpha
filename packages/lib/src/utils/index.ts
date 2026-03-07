/**
 * Utility functions
 */

/**
 * Sleep for a specified number of milliseconds
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if a value is defined (not null or undefined)
 * @param value - Value to check
 * @returns True if value is defined
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Format a date to ISO string
 * @param date - Date to format
 * @returns ISO string representation
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};
