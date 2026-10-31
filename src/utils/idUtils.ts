/**
 * Identifier generation utilities for Celebrio AI.
 */

/**
 * Generates a unique, collision-resistant string ID with an optional prefix.
 * Compatible with existing application conventions and local storage.
 *
 * Format: `${prefix}-${timestamp}-${randomSuffix}`
 * Example: `event-1730352000000-a1b2c3`
 *
 * @param prefix Prefix denoting the entity type (e.g. 'event', 'b', 'vt', 'm', 'usr', 'msg', 'toast')
 * @returns Unique string identifier
 */
export function generateId(prefix: string = 'id'): string {
  // Normalize prefix in case callers pass 'event-' or 'event'
  const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
  const timestamp = Date.now();
  // 6-character alphanumeric random token providing collision resistance
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${cleanPrefix}-${timestamp}-${randomSuffix}`;
}
