/**
 * Spacing tokens for Protocol: Silent Night
 *
 * Based on 4px base unit
 */

/**
 * Spacing scale
 */
export const spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 16px */
  md: 16,
  /** 24px */
  lg: 24,
  /** 32px */
  xl: 32,
  /** 48px */
  '2xl': 48,
  /** 64px */
  '3xl': 64,
  /** 96px */
  '4xl': 96,
} as const;

/**
 * Border radii
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Border widths
 */
export const borderWidth = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 4,
} as const;

/**
 * Z-index layers
 */
export const zIndex = {
  background: 0,
  content: 10,
  elevated: 50,
  modal: 100,
  overlay: 200,
  tooltip: 300,
  notification: 400,
  maximum: 9999,
} as const;
