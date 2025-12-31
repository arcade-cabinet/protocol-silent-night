/**
 * Security utilities for data integrity and validation.
 */

const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

/**
 * Calculates a FNV-1a 32-bit hash of the input string.
 * Used for basic integrity checking of local storage data.
 * Note: This is not a cryptographic hash and only prevents casual tampering.
 */
export const calculateChecksum = (data: string): string => {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    // Force 32-bit unsigned integer multiplication simulation
    // Use BigInt for accurate large number multiplication if Math.imul behavior is inconsistent
    // or stick to Math.imul which is standard for 32-bit int multiplication in JS.
    // Reverting to Math.imul(hash, FNV_PRIME) as it is the standard way to implement FNV-1a in JS.
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash.toString(16);
};

/**
 * Verifies if the data matches the provided checksum.
 */
export const verifyChecksum = (data: string, checksum: string): boolean => {
  return calculateChecksum(data) === checksum;
};

/**
 * Wraps data with a checksum for storage.
 */
export const wrapWithChecksum = <T>(data: T): { data: T; checksum: string } => {
  const jsonString = JSON.stringify(data);
  const checksum = calculateChecksum(jsonString);
  return { data, checksum };
};

/**
 * Validates and unwraps data with a checksum.
 * Returns null if validation fails.
 */
export const unwrapWithChecksum = <T>(storedData: { data: T; checksum: string }): T | null => {
  if (!storedData || typeof storedData !== 'object') return null;

  const { data, checksum } = storedData;
  if (data === undefined || checksum === undefined) return null;

  const calculated = calculateChecksum(JSON.stringify(data));
  if (calculated !== checksum) {
    console.warn('Security: Data integrity check failed. Possible tampering detected.');
    return null;
  }

  return data;
};
