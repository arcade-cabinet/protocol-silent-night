/**
 * Typography tokens for Protocol: Silent Night
 */

/**
 * Font families
 */
export const fontFamily = {
  primary: 'System',
  mono: 'Courier',
} as const;

/**
 * Font sizes (in pixels)
 */
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

/**
 * Font weights
 */
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
} as const;

/**
 * Letter spacing values
 */
export const letterSpacing = {
  tight: 1,
  normal: 2,
  wide: 4,
  extraWide: 8,
} as const;

/**
 * Line heights
 */
export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/**
 * Combined typography export
 */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
} as const;
