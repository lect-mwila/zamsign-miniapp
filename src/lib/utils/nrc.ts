/**
 * NRC Helper Utilities for Zambian National Registration Card
 * Format: XXXXXX/XX/X  (e.g. 123456/78/1)
 */

export const NRC_PATTERN = /^\d{6}\/\d{2}\/\d{1}$/;

/**
 * Formats input as user types to enforce XXXXXX/XX/X pattern
 * Example: 
 *   "123456"     → "123456"
 *   "1234567"    → "123456/7"
 *   "12345678"   → "123456/78"
 *   "123456781"  → "123456/78/1"
 */
export function formatNRCInput(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';

  let formatted = digits.slice(0, 6);

  if (digits.length > 6) {
    formatted += '/' + digits.slice(6, 8);
  }

  if (digits.length > 8) {
    formatted += '/' + digits.slice(8, 9);
  }

  return formatted;
}

/**
 * Checks if the NRC is in correct format and all parts are numeric
 */
export function isValidNRC(nrc: string | null | undefined): boolean {
  if (!nrc) return false;
  return NRC_PATTERN.test(nrc.trim());
}

/**
 * Normalizes NRC (trims and ensures correct format)
 * Returns null if invalid
 */
export function normalizeNRC(nrc: string | null | undefined): string | null {
  if (!nrc) return null;
  
  const trimmed = nrc.trim();
  if (isValidNRC(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Extracts parts from NRC
 * Returns { part1, part2, part3 } or null if invalid
 */
export function parseNRC(nrc: string | null | undefined) {
  if (!nrc || !isValidNRC(nrc)) return null;

  const [part1, part2, part3] = nrc.trim().split('/');
  return {
    part1: part1 || '',   // 6 digits
    part2: part2 || '',   // 2 digits
    part3: part3 || '',   // 1 digit
  };
}

/**
 * Generates a fake NRC for testing (optional)
 */
export function generateTestNRC(): string {
  const part1 = Math.floor(100000 + Math.random() * 900000); // 6 digits
  const part2 = Math.floor(10 + Math.random() * 90);         // 2 digits
  const part3 = Math.floor(1 + Math.random() * 9);           // 1 digit
  return `${part1}/${part2}/${part3}`;
}