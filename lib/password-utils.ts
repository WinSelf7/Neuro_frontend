/**
 * Password utility functions
 */

/**
 * Maximum password length allowed by the backend (72 bytes)
 */
export const MAX_PASSWORD_LENGTH = 72;

/**
 * Truncate password to the maximum allowed length
 * @param password - The password to truncate
 * @returns Truncated password
 */
export function truncatePassword(password: string): string {
  return password.length > MAX_PASSWORD_LENGTH 
    ? password.substring(0, MAX_PASSWORD_LENGTH) 
    : password;
}

/**
 * Validate password length
 * @param password - The password to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validatePasswordLength(password: string): string {
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be ${MAX_PASSWORD_LENGTH} characters or less`;
  }
  return "";
}

/**
 * Check if password will be truncated
 * @param password - The password to check
 * @returns True if password will be truncated
 */
export function willTruncatePassword(password: string): boolean {
  return password.length > MAX_PASSWORD_LENGTH;
}
