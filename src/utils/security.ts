/**
 * Security utilities for data integrity and validation.
 */

/**
 * Calculates a simple FNV-1a hash of the given data string.
 * This is used for integrity checking, not cryptographic security.
 * @param str The string to hash
 * @returns The calculated hash as a hex string
 */
export const calculateChecksum = (str: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Wrapper structure for secured data
 */
export interface SecuredData<T> {
  data: T;
  checksum: string;
  timestamp: number;
}

/**
 * Validates and unwraps secured data.
 * @param jsonString The JSON string containing the SecuredData
 * @returns The unwrapped data if valid, null otherwise
 */
export const validateAndUnwrap = <T>(jsonString: string): T | null => {
  try {
    const parsed = JSON.parse(jsonString);

    // Check if it's the new secured format
    if (parsed && typeof parsed === 'object' && 'checksum' in parsed && 'data' in parsed) {
      const { data, checksum } = parsed as SecuredData<T>;
      const calculated = calculateChecksum(JSON.stringify(data));

      if (calculated === checksum) {
        return data;
      } else {
        console.error('Data integrity check failed: Checksum mismatch');
        return null;
      }
    }

    // Legacy fallback: return null to indicate "not secured format"
    // The caller should handle the case where this returns null but the data might be legacy.
    return null;
  } catch (e) {
    console.error('Failed to parse secured data:', e);
    return null;
  }
};

/**
 * Wraps data with a checksum for storage.
 * @param data The data to wrap
 * @returns The stringified SecuredData
 */
export const wrapAndSecure = <T>(data: T): string => {
  const json = JSON.stringify(data);
  const checksum = calculateChecksum(json);
  const secured: SecuredData<T> = {
    data,
    checksum,
    timestamp: Date.now(),
  };
  return JSON.stringify(secured);
};
