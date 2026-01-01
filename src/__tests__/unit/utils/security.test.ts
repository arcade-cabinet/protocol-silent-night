import { describe, expect, it } from 'vitest';
import { calculateChecksum, unwrapWithChecksum, wrapWithChecksum } from '@/utils/security';

describe('Security Utils', () => {
  const testData = { name: 'Sentinel', role: 'Security' };

  describe('calculateChecksum', () => {
    it('should return a consistent hash for the same input', () => {
      const input = 'test-string';
      const hash1 = calculateChecksum(input);
      const hash2 = calculateChecksum(input);
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = calculateChecksum('input1');
      const hash2 = calculateChecksum('input2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('wrapWithChecksum', () => {
    it('should wrap data with checksum', () => {
      const wrapped = wrapWithChecksum(testData);

      expect(wrapped).toHaveProperty('data');
      expect(wrapped).toHaveProperty('checksum');
      expect(wrapped.data).toEqual(testData);
    });
  });

  describe('unwrapWithChecksum', () => {
    it('should return data if checksum matches', () => {
      const wrapped = wrapWithChecksum(testData);
      const result = unwrapWithChecksum(wrapped);
      expect(result).toEqual(testData);
    });

    it('should return null if checksum does not match', () => {
      const wrapped = wrapWithChecksum(testData);

      // Tamper with the data
      wrapped.data.name = 'Hacker';

      const result = unwrapWithChecksum(wrapped);
      expect(result).toBeNull();
    });

    it('should return null for data missing security fields', () => {
      const result = unwrapWithChecksum({ data: testData, checksum: undefined as unknown as string });
      expect(result).toBeNull();
    });
  });
});
