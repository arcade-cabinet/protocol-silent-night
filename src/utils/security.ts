// FNV-1a Hash Implementation
const FNV_PRIME = 0x01000193;
const OFFSET_BASIS = 0x811c9dc5;

export const calculateChecksum = (data: string): string => {
  let hash = OFFSET_BASIS;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  // Convert to 32-bit unsigned integer then to hex
  return (hash >>> 0).toString(16);
};

export const verifyChecksum = (data: string, checksum: string): boolean => {
  return calculateChecksum(data) === checksum;
};
