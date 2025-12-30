// Security utilities for Sentinel
// Provides checksum generation and verification for data integrity

// Simple hash function (Fowler-Noll-Vo) for client-side tamper resistance
// This is NOT cryptographic security, but prevents casual editing of localStorage
export function generateChecksum(data: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

export function verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}
