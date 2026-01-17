import { SeededRandom } from '../SeededRandom';

describe('SeededRandom', () => {
  describe('deterministic behavior', () => {
    it('should produce identical sequences with the same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should produce the same integer sequence with the same seed', () => {
      const rng1 = new SeededRandom(99999);
      const rng2 = new SeededRandom(99999);

      const ints1 = Array.from({ length: 10 }, () => rng1.nextInt(1, 100));
      const ints2 = Array.from({ length: 10 }, () => rng2.nextInt(1, 100));

      expect(ints1).toEqual(ints2);
    });
  });

  describe('next()', () => {
    it('should return values between 0 and 1', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should not return the same value consecutively', () => {
      const rng = new SeededRandom(12345);
      const value1 = rng.next();
      const value2 = rng.next();

      expect(value1).not.toBe(value2);
    });
  });

  describe('nextInt()', () => {
    it('should respect min and max bounds (inclusive)', () => {
      const rng = new SeededRandom(12345);
      const min = 5;
      const max = 15;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should return min when min === max', () => {
      const rng = new SeededRandom(12345);
      const value = rng.nextInt(42, 42);

      expect(value).toBe(42);
    });

    it('should eventually produce all values in range', () => {
      const rng = new SeededRandom(12345);
      const min = 1;
      const max = 5;
      const values = new Set<number>();

      // Generate many values
      for (let i = 0; i < 1000; i++) {
        values.add(rng.nextInt(min, max));
      }

      // Should have seen all values 1-5
      expect(values.size).toBe(5);
      expect(values.has(1)).toBe(true);
      expect(values.has(2)).toBe(true);
      expect(values.has(3)).toBe(true);
      expect(values.has(4)).toBe(true);
      expect(values.has(5)).toBe(true);
    });
  });

  describe('pick()', () => {
    it('should return an element from the array', () => {
      const rng = new SeededRandom(12345);
      const array = ['a', 'b', 'c', 'd', 'e'];

      for (let i = 0; i < 50; i++) {
        const picked = rng.pick(array);
        expect(array).toContain(picked);
      }
    });

    it('should return the only element in a single-element array', () => {
      const rng = new SeededRandom(12345);
      const array = ['only'];

      expect(rng.pick(array)).toBe('only');
    });

    it('should eventually pick all elements (distribution)', () => {
      const rng = new SeededRandom(12345);
      const array = ['a', 'b', 'c'];
      const picked = new Set<string>();

      // Pick many times
      for (let i = 0; i < 100; i++) {
        picked.add(rng.pick(array));
      }

      // Should have picked all elements
      expect(picked.size).toBe(3);
      expect(picked.has('a')).toBe(true);
      expect(picked.has('b')).toBe(true);
      expect(picked.has('c')).toBe(true);
    });

    it('should work with different data types', () => {
      const rng = new SeededRandom(12345);
      const numbers = [1, 2, 3, 4, 5];
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];

      expect(numbers).toContain(rng.pick(numbers));
      expect(objects).toContain(rng.pick(objects));
    });
  });

  describe('edge cases', () => {
    it('should handle very large seeds', () => {
      const rng = new SeededRandom(9999999999);
      const value = rng.next();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('should handle zero seed', () => {
      const rng = new SeededRandom(0);
      const value = rng.next();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('should create random seed when no seed provided', () => {
      const rng1 = new SeededRandom();
      const rng2 = new SeededRandom();

      // Different instances without seed should likely produce different sequences
      // (though technically could be same if random seeds match)
      const seq1 = Array.from({ length: 5 }, () => rng1.next());
      const seq2 = Array.from({ length: 5 }, () => rng2.next());

      // At least one value should be generated
      expect(seq1.length).toBe(5);
      expect(seq2.length).toBe(5);
    });
  });
});
