/**
 * Seeded pseudo-random number generator for deterministic gameplay.
 *
 * This class implements a Linear Congruential Generator (LCG) algorithm
 * to provide deterministic random numbers. Same seed = same sequence.
 *
 * Used for:
 * - Enemy spawn patterns
 * - Upgrade choice generation
 * - Procedural terrain generation
 *
 * @example
 * ```typescript
 * const rng = new SeededRandom(12345);
 * const value = rng.next(); // 0-1
 * const int = rng.nextInt(1, 10); // 1-10 inclusive
 * const item = rng.pick(['a', 'b', 'c']); // random element
 * ```
 */
export class SeededRandom {
  private state: number;

  /**
   * Creates a new seeded random number generator.
   * @param seed - Optional seed value. If not provided, uses random seed.
   */
  constructor(seed?: number) {
    this.state = seed ?? Math.floor(Math.random() * 999999);
  }

  /**
   * Returns a random float between 0 and 1.
   * Uses LCG algorithm: state = (state * 9301 + 49297) % 233280
   */
  next(): number {
    this.state = (this.state * 9301 + 49297) % 233280;
    return this.state / 233280;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from an array.
   * @param array - Array to pick from
   * @returns Random element from the array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}
