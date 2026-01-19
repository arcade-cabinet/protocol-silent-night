/**
 * Breakpoint tokens for Protocol: Silent Night
 *
 * Supports responsive design across phones, tablets, and foldables
 */

/**
 * Breakpoint values (in pixels)
 */
export const breakpoints = {
  /** Phone portrait */
  phone: 0,
  /** Phone landscape / small tablet (568px+) */
  phoneLandscape: 568,
  /** Tablet portrait (768px+) */
  tablet: 768,
  /** Tablet landscape / foldable unfolded (1024px+) */
  tabletLandscape: 1024,
  /** Large screens (1280px+) */
  desktop: 1280,
  /** Foldable unfolded - OnePlus Open style (1800px+) */
  foldableUnfolded: 1800,
} as const;

/**
 * Device profiles for target devices
 */
export const deviceProfiles = {
  // Android phones
  pixel8a: {
    name: 'Google Pixel 8a',
    width: 1080,
    height: 2400,
    density: 2.625,
    foldable: false,
  },

  // Android foldables
  oneplusOpen: {
    name: 'OnePlus Open',
    density: 2.75,
    foldable: true,
    folded: {
      width: 1116,
      height: 2484,
    },
    unfolded: {
      width: 2268,
      height: 2076,
    },
    // Folding axis: horizontal (book-style fold)
    foldAxis: 'horizontal' as const,
    // Hinge area to avoid
    hingeArea: {
      width: 48,
      start: 1110,
    },
  },

  galaxyFold5: {
    name: 'Samsung Galaxy Z Fold 5',
    density: 3.0,
    foldable: true,
    folded: {
      width: 904,
      height: 2316,
    },
    unfolded: {
      width: 1812,
      height: 2176,
    },
    foldAxis: 'horizontal' as const,
    hingeArea: {
      width: 0, // No physical hinge gap
      start: 906,
    },
  },

  // iOS devices
  iphone16ProMax: {
    name: 'iPhone 16 Pro Max',
    width: 1320,
    height: 2868,
    density: 3.0,
    foldable: false,
  },

  ipadPro13: {
    name: 'iPad Pro 13-inch',
    width: 2064,
    height: 2752,
    density: 2.0,
    foldable: false,
  },
} as const;

/**
 * Get breakpoint name for a given width
 */
export function getBreakpointName(width: number): keyof typeof breakpoints {
  if (width >= breakpoints.foldableUnfolded) return 'foldableUnfolded';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tabletLandscape) return 'tabletLandscape';
  if (width >= breakpoints.tablet) return 'tablet';
  if (width >= breakpoints.phoneLandscape) return 'phoneLandscape';
  return 'phone';
}

/**
 * Check if device is likely a foldable in unfolded state
 */
export function isUnfoldedFoldable(width: number, height: number): boolean {
  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  // Foldables when unfolded have aspect ratios close to 1:1
  return aspectRatio > 0.75 && width >= breakpoints.tabletLandscape;
}
