import { describe, expect, it } from 'vitest';
import { calculateChecksum, validateAndUnwrap, wrapAndSecure } from '@/utils/security';

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

  describe('wrapAndSecure', () => {
    it('should wrap data with checksum and timestamp', () => {
      const securedString = wrapAndSecure(testData);
      const secured = JSON.parse(securedString);

      expect(secured).toHaveProperty('data');
      expect(secured).toHaveProperty('checksum');
      expect(secured).toHaveProperty('timestamp');
      expect(secured.data).toEqual(testData);
    });
  });

  describe('validateAndUnwrap', () => {
    it('should return data if checksum matches', () => {
      const securedString = wrapAndSecure(testData);
      const result = validateAndUnwrap(securedString);
      expect(result).toEqual(testData);
    });

    it('should return null if checksum does not match', () => {
      const securedString = wrapAndSecure(testData);
      const secured = JSON.parse(securedString);

      // Tamper with the data
      secured.data.name = 'Hacker';

      const tamperedString = JSON.stringify(secured);
      const result = validateAndUnwrap(tamperedString);

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const result = validateAndUnwrap('invalid-json');
      expect(result).toBeNull();
    });

    it('should return null for data missing security fields', () => {
      const plainJson = JSON.stringify(testData);
      const result = validateAndUnwrap(plainJson);
      expect(result).toBeNull();
    });
  });
});
