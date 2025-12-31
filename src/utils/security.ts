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
    // We use Math.imul for better performance if available, or manual bit shifting
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
 * Wraps data with a checksum and timestamp for storage.
 * Returns a JSON string.
 */
export const wrapAndSecure = <T>(data: T): string => {
  const jsonString = JSON.stringify(data);
  const checksum = calculateChecksum(jsonString);
  return JSON.stringify({
    data,
    checksum,
    timestamp: Date.now(),
  });
};

/**
 * Validates and unwraps data with a checksum.
 * Expects a JSON string.
 * Returns null if validation fails.
 */
export const validateAndUnwrap = <T>(securedString: string): T | null => {
  try {
    if (!securedString) return null;
    const secured = JSON.parse(securedString);
    
    if (!secured || typeof secured !== 'object') return null;

    const { data, checksum } = secured;
    if (data === undefined || checksum === undefined) return null;

    const calculated = calculateChecksum(JSON.stringify(data));
    if (calculated !== checksum) {
      console.warn('Security: Data integrity check failed. Possible tampering detected.');
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
};

/**
 * Legacy support for wrapWithChecksum
 */
export const wrapWithChecksum = <T>(data: T): { data: T; checksum: string } => {
  const jsonString = JSON.stringify(data);
  const checksum = calculateChecksum(jsonString);
  return { data, checksum };
};

/**
 * Legacy support for unwrapWithChecksum
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
