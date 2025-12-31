import { describe, expect, it, vi, afterEach } from 'vitest';
import { SeededRandom } from '@/types';

describe('SeededRandom Security', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(67890);
    expect(rng1.next()).not.toBe(rng2.next());
  });

  it('should generate same sequence for same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
  });

  it('should use crypto.getRandomValues if available when no seed provided', () => {
    // Mock crypto.getRandomValues
    const getRandomValues = vi.fn((array: Uint32Array) => {
      array[0] = 12345;
      return array;
    });

    const originalCrypto = window.crypto;
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues,
      },
      writable: true,
    });

    const rng = new SeededRandom();

    expect(getRandomValues).toHaveBeenCalled();
    // Since we forced the seed to 12345 via mock
    const rngExpected = new SeededRandom(12345);
    expect(rng.next()).toBe(rngExpected.next());

    // Restore crypto
    Object.defineProperty(window, 'crypto', { value: originalCrypto, writable: true });
  });

  it('should fall back to Math.random if crypto is not available', () => {
    const originalCrypto = window.crypto;
    // @ts-expect-error
    Object.defineProperty(window, 'crypto', { value: undefined, writable: true });

    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const _rng = new SeededRandom();

    expect(mathRandomSpy).toHaveBeenCalled();

    // Restore
    Object.defineProperty(window, 'crypto', { value: originalCrypto, writable: true });
    mathRandomSpy.mockRestore();
  });
});
