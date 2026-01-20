/**
 * Color tokens for Protocol: Silent Night
 *
 * Cyberpunk Christmas theme palette
 */

/**
 * Primary brand colors
 */
export const primary = {
  neon: '#00ff66',
  neonDim: '#00cc52',
  neonGlow: 'rgba(0, 255, 102, 0.3)',
} as const;

/**
 * Background colors
 */
export const background = {
  dark: '#0a0a1a',
  darker: '#050510',
  card: '#111122',
  cardHover: '#1a1a2e',
  overlay: 'rgba(5, 5, 16, 0.9)',
} as const;

/**
 * Text colors
 */
export const text = {
  primary: '#ffffff',
  secondary: '#aaaaaa',
  muted: '#666666',
  accent: '#00ff66',
  danger: '#ff3366',
  warning: '#ffcc00',
} as const;

/**
 * Semantic colors
 */
export const health = {
  full: '#00ff66',
  mid: '#ffcc00',
  low: '#ff3366',
  background: '#333333',
} as const;

/**
 * UI element colors
 */
export const border = {
  default: '#222233',
  active: '#00ff66',
  danger: '#ff3366',
} as const;

/**
 * Character class colors
 */
export const classes = {
  santa: '#ff4444',
  elf: '#44ff44',
  bumble: '#ffffff',
} as const;

/**
 * BabylonJS GUI-compatible color format (hex without #)
 */
export const babylon = {
  primary: '00ff66',
  background: '0a0a1a',
  backgroundAlpha: '0a0a1acc',
  white: 'ffffff',
  danger: 'ff3366',
  warning: 'ffcc00',
} as const;

/**
 * Combined colors export
 */
export const colors = {
  primary,
  background,
  text,
  health,
  border,
  classes,
  babylon,
} as const;
