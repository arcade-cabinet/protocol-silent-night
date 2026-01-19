/**
 * @fileoverview Pure JavaScript noise functions for procedural terrain generation
 * @module terrain/NoiseGenerator
 *
 * Implements Simplex-like noise without external dependencies.
 * Used for terrain height maps and obstacle placement.
 */

/**
 * Permutation table for noise generation (0-255 shuffled, then doubled)
 */
const PERM: number[] = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

// Double the permutation table for overflow handling
const P: number[] = [...PERM, ...PERM];

/**
 * Gradient vectors for 3D noise
 */
const GRAD3: number[][] = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

/**
 * Fast floor function
 */
function fastFloor(x: number): number {
  return x > 0 ? Math.floor(x) : Math.floor(x) - (x !== Math.floor(x) ? 1 : 0);
}

/**
 * Dot product for gradient
 */
function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

/**
 * Dot product for 3D gradient
 */
function dot3(g: number[], x: number, y: number, z: number): number {
  return g[0] * x + g[1] * y + g[2] * z;
}

/**
 * Fade function for smoother interpolation (6t^5 - 15t^4 + 10t^3)
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * 2D Perlin-style noise function
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value between -1 and 1
 *
 * @example
 * ```typescript
 * const height = noise2D(x * 0.1, z * 0.1);
 * ```
 */
export function noise2D(x: number, y: number): number {
  // Find unit grid cell containing point
  const X = fastFloor(x) & 255;
  const Y = fastFloor(y) & 255;

  // Get relative coordinates within cell
  const xf = x - fastFloor(x);
  const yf = y - fastFloor(y);

  // Compute fade curves for x and y
  const u = fade(xf);
  const v = fade(yf);

  // Hash coordinates of the 4 square corners
  const aa = P[P[X] + Y];
  const ab = P[P[X] + Y + 1];
  const ba = P[P[X + 1] + Y];
  const bb = P[P[X + 1] + Y + 1];

  // Get gradients and compute dot products
  const g00 = GRAD3[aa % 12];
  const g10 = GRAD3[ba % 12];
  const g01 = GRAD3[ab % 12];
  const g11 = GRAD3[bb % 12];

  const n00 = dot2(g00, xf, yf);
  const n10 = dot2(g10, xf - 1, yf);
  const n01 = dot2(g01, xf, yf - 1);
  const n11 = dot2(g11, xf - 1, yf - 1);

  // Bilinear interpolation
  const nx0 = lerp(n00, n10, u);
  const nx1 = lerp(n01, n11, u);
  return lerp(nx0, nx1, v);
}

/**
 * 3D Perlin-style noise function
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Noise value between -1 and 1
 *
 * @example
 * ```typescript
 * const density = noise3D(x * 0.05, y * 0.05, z * 0.05);
 * ```
 */
export function noise3D(x: number, y: number, z: number): number {
  // Find unit cube containing point
  const X = fastFloor(x) & 255;
  const Y = fastFloor(y) & 255;
  const Z = fastFloor(z) & 255;

  // Get relative coordinates within cube
  const xf = x - fastFloor(x);
  const yf = y - fastFloor(y);
  const zf = z - fastFloor(z);

  // Compute fade curves
  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);

  // Hash coordinates of the 8 cube corners
  const aaa = P[P[P[X] + Y] + Z];
  const aba = P[P[P[X] + Y + 1] + Z];
  const aab = P[P[P[X] + Y] + Z + 1];
  const abb = P[P[P[X] + Y + 1] + Z + 1];
  const baa = P[P[P[X + 1] + Y] + Z];
  const bba = P[P[P[X + 1] + Y + 1] + Z];
  const bab = P[P[P[X + 1] + Y] + Z + 1];
  const bbb = P[P[P[X + 1] + Y + 1] + Z + 1];

  // Gradient dot products
  const n000 = dot3(GRAD3[aaa % 12], xf, yf, zf);
  const n100 = dot3(GRAD3[baa % 12], xf - 1, yf, zf);
  const n010 = dot3(GRAD3[aba % 12], xf, yf - 1, zf);
  const n110 = dot3(GRAD3[bba % 12], xf - 1, yf - 1, zf);
  const n001 = dot3(GRAD3[aab % 12], xf, yf, zf - 1);
  const n101 = dot3(GRAD3[bab % 12], xf - 1, yf, zf - 1);
  const n011 = dot3(GRAD3[abb % 12], xf, yf - 1, zf - 1);
  const n111 = dot3(GRAD3[bbb % 12], xf - 1, yf - 1, zf - 1);

  // Trilinear interpolation
  const nx00 = lerp(n000, n100, u);
  const nx01 = lerp(n001, n101, u);
  const nx10 = lerp(n010, n110, u);
  const nx11 = lerp(n011, n111, u);
  const nxy0 = lerp(nx00, nx10, v);
  const nxy1 = lerp(nx01, nx11, v);
  return lerp(nxy0, nxy1, w);
}

/**
 * Fractional Brownian Motion (FBM) - layered noise for natural terrain
 *
 * Combines multiple octaves of noise at different frequencies and amplitudes
 * to create more natural-looking terrain variation.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate (can be used for animation or as time)
 * @param octaves - Number of noise layers (default: 4)
 * @param lacunarity - Frequency multiplier per octave (default: 2)
 * @param persistence - Amplitude multiplier per octave (default: 0.5)
 * @returns Combined noise value
 *
 * @example
 * ```typescript
 * // Natural terrain with 4 octaves
 * const height = fbm(x, 0, z, 4) * heightMultiplier;
 *
 * // Animated effect
 * const effect = fbm(x, y, time * 0.1, 3);
 * ```
 */
export function fbm(
  x: number,
  y: number,
  z: number,
  octaves: number = 4,
  lacunarity: number = 2,
  persistence: number = 0.5
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

/**
 * 2D FBM variant for terrain height maps
 *
 * @param x - X coordinate
 * @param z - Z coordinate
 * @param octaves - Number of noise layers
 * @param lacunarity - Frequency multiplier per octave
 * @param persistence - Amplitude multiplier per octave
 * @returns Combined noise value normalized to [-1, 1]
 */
export function fbm2D(
  x: number,
  z: number,
  octaves: number = 4,
  lacunarity: number = 2,
  persistence: number = 0.5
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

/**
 * Ridge noise for sharper terrain features
 *
 * Creates ridged, mountain-like formations by taking the absolute
 * value of noise and inverting it.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param octaves - Number of noise layers
 * @returns Ridge noise value
 */
export function ridgeNoise(
  x: number,
  y: number,
  z: number,
  octaves: number = 4
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const n = noise3D(x * frequency, y * frequency, z * frequency);
    // Ridge transformation: 1 - |n|
    total += (1 - Math.abs(n)) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / maxValue;
}

/**
 * Turbulence noise for chaotic effects
 *
 * Sums absolute values of noise at different frequencies
 * for turbulent, cloud-like patterns.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param octaves - Number of noise layers
 * @returns Turbulence value (always positive)
 */
export function turbulence(
  x: number,
  y: number,
  z: number,
  octaves: number = 4
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;

  for (let i = 0; i < octaves; i++) {
    total += Math.abs(noise3D(x * frequency, y * frequency, z * frequency)) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total;
}

/**
 * Voronoi-like cellular noise for crystalline patterns
 *
 * Creates cell-like patterns useful for ice/crystal effects.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param scale - Cell size scale
 * @returns Distance to nearest cell center (0-1)
 */
export function cellularNoise(x: number, y: number, scale: number = 1): number {
  const xs = x * scale;
  const ys = y * scale;
  const xi = fastFloor(xs);
  const yi = fastFloor(ys);

  let minDist = 1;

  // Check 3x3 neighborhood
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const cellX = xi + i;
      const cellY = yi + j;

      // Generate pseudo-random point in cell
      const h = P[(P[cellX & 255] + cellY) & 255];
      const px = cellX + (h / 255);
      const py = cellY + (P[h] / 255);

      // Distance to point
      const dx = xs - px;
      const dy = ys - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
      }
    }
  }

  return minDist;
}

/**
 * Creates a noise generator with a specific seed
 *
 * @param seed - Seed value for deterministic results
 * @returns Object with seeded noise functions
 */
export function createSeededNoise(seed: number): {
  noise2D: (x: number, y: number) => number;
  noise3D: (x: number, y: number, z: number) => number;
  fbm: (x: number, y: number, z: number, octaves?: number) => number;
} {
  // Create seeded permutation
  const seededPerm = [...PERM];

  // Fisher-Yates shuffle with seed
  let s = seed;
  for (let i = seededPerm.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [seededPerm[i], seededPerm[j]] = [seededPerm[j], seededPerm[i]];
  }

  const seededP = [...seededPerm, ...seededPerm];

  // Return functions using seeded permutation
  return {
    noise2D: (x: number, y: number): number => {
      const X = fastFloor(x) & 255;
      const Y = fastFloor(y) & 255;
      const xf = x - fastFloor(x);
      const yf = y - fastFloor(y);
      const u = fade(xf);
      const v = fade(yf);

      const aa = seededP[seededP[X] + Y];
      const ab = seededP[seededP[X] + Y + 1];
      const ba = seededP[seededP[X + 1] + Y];
      const bb = seededP[seededP[X + 1] + Y + 1];

      const g00 = GRAD3[aa % 12];
      const g10 = GRAD3[ba % 12];
      const g01 = GRAD3[ab % 12];
      const g11 = GRAD3[bb % 12];

      const n00 = dot2(g00, xf, yf);
      const n10 = dot2(g10, xf - 1, yf);
      const n01 = dot2(g01, xf, yf - 1);
      const n11 = dot2(g11, xf - 1, yf - 1);

      const nx0 = lerp(n00, n10, u);
      const nx1 = lerp(n01, n11, u);
      return lerp(nx0, nx1, v);
    },

    noise3D: (x: number, y: number, z: number): number => {
      const X = fastFloor(x) & 255;
      const Y = fastFloor(y) & 255;
      const Z = fastFloor(z) & 255;
      const xf = x - fastFloor(x);
      const yf = y - fastFloor(y);
      const zf = z - fastFloor(z);
      const u = fade(xf);
      const v = fade(yf);
      const w = fade(zf);

      const aaa = seededP[seededP[seededP[X] + Y] + Z];
      const aba = seededP[seededP[seededP[X] + Y + 1] + Z];
      const aab = seededP[seededP[seededP[X] + Y] + Z + 1];
      const abb = seededP[seededP[seededP[X] + Y + 1] + Z + 1];
      const baa = seededP[seededP[seededP[X + 1] + Y] + Z];
      const bba = seededP[seededP[seededP[X + 1] + Y + 1] + Z];
      const bab = seededP[seededP[seededP[X + 1] + Y] + Z + 1];
      const bbb = seededP[seededP[seededP[X + 1] + Y + 1] + Z + 1];

      const n000 = dot3(GRAD3[aaa % 12], xf, yf, zf);
      const n100 = dot3(GRAD3[baa % 12], xf - 1, yf, zf);
      const n010 = dot3(GRAD3[aba % 12], xf, yf - 1, zf);
      const n110 = dot3(GRAD3[bba % 12], xf - 1, yf - 1, zf);
      const n001 = dot3(GRAD3[aab % 12], xf, yf, zf - 1);
      const n101 = dot3(GRAD3[bab % 12], xf - 1, yf, zf - 1);
      const n011 = dot3(GRAD3[abb % 12], xf, yf - 1, zf - 1);
      const n111 = dot3(GRAD3[bbb % 12], xf - 1, yf - 1, zf - 1);

      const nx00 = lerp(n000, n100, u);
      const nx01 = lerp(n001, n101, u);
      const nx10 = lerp(n010, n110, u);
      const nx11 = lerp(n011, n111, u);
      const nxy0 = lerp(nx00, nx10, v);
      const nxy1 = lerp(nx01, nx11, v);
      return lerp(nxy0, nxy1, w);
    },

    fbm: (x: number, y: number, z: number, octaves: number = 4): number => {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;

      for (let i = 0; i < octaves; i++) {
        const X = fastFloor(x * frequency) & 255;
        const Y = fastFloor(y * frequency) & 255;
        const Z = fastFloor(z * frequency) & 255;
        const xf = x * frequency - fastFloor(x * frequency);
        const yf = y * frequency - fastFloor(y * frequency);
        const zf = z * frequency - fastFloor(z * frequency);
        const u = fade(xf);
        const v = fade(yf);
        const w = fade(zf);

        const aaa = seededP[seededP[seededP[X] + Y] + Z];
        const aba = seededP[seededP[seededP[X] + Y + 1] + Z];
        const aab = seededP[seededP[seededP[X] + Y] + Z + 1];
        const abb = seededP[seededP[seededP[X] + Y + 1] + Z + 1];
        const baa = seededP[seededP[seededP[X + 1] + Y] + Z];
        const bba = seededP[seededP[seededP[X + 1] + Y + 1] + Z];
        const bab = seededP[seededP[seededP[X + 1] + Y] + Z + 1];
        const bbb = seededP[seededP[seededP[X + 1] + Y + 1] + Z + 1];

        const n000 = dot3(GRAD3[aaa % 12], xf, yf, zf);
        const n100 = dot3(GRAD3[baa % 12], xf - 1, yf, zf);
        const n010 = dot3(GRAD3[aba % 12], xf, yf - 1, zf);
        const n110 = dot3(GRAD3[bba % 12], xf - 1, yf - 1, zf);
        const n001 = dot3(GRAD3[aab % 12], xf, yf, zf - 1);
        const n101 = dot3(GRAD3[bab % 12], xf - 1, yf, zf - 1);
        const n011 = dot3(GRAD3[abb % 12], xf, yf - 1, zf - 1);
        const n111 = dot3(GRAD3[bbb % 12], xf - 1, yf - 1, zf - 1);

        const nx00 = lerp(n000, n100, u);
        const nx01 = lerp(n001, n101, u);
        const nx10 = lerp(n010, n110, u);
        const nx11 = lerp(n011, n111, u);
        const nxy0 = lerp(nx00, nx10, v);
        const nxy1 = lerp(nx01, nx11, v);
        total += lerp(nxy0, nxy1, w) * amplitude;

        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      return total / maxValue;
    },
  };
}
