/**
 * Dark Yuletide Theme - Krampus / Horrific Holiday
 *
 * A twisted take on Christmas aesthetics:
 * - Deep, ominous reds and blacks
 * - Toxic green accents (corrupted Christmas green)
 * - Industrial/cyberpunk fusion
 * - Frost and ice with a sinister edge
 *
 * Color Inspiration:
 * - Krampus legends (Alpine folklore)
 * - Corrupted machinery/AI gone wrong
 * - Frozen, desolate winter nights
 * - Neon signs in abandoned malls
 */

import type { Theme } from './index';
import { typography } from '../tokens/typography';
import { spacing, borderRadius } from '../tokens/spacing';
import { animation } from '../tokens/animation';

/**
 * Dark Yuletide color palette
 */
export const darkYuletideColors = {
  // Primary - Corrupted Christmas green / toxic neon
  primary: {
    main: '#00ff66', // Toxic neon green
    dim: '#00cc52',
    dark: '#008836',
    glow: 'rgba(0, 255, 102, 0.4)',
  },

  // Secondary - Krampus red / blood in snow
  secondary: {
    main: '#cc0033', // Deep crimson
    bright: '#ff1a4d', // Bright warning red
    dark: '#8b0022',
    glow: 'rgba(204, 0, 51, 0.4)',
  },

  // Accent - Frost blue / frozen machinery
  accent: {
    main: '#00d4ff', // Electric ice
    dim: '#00a8cc',
    dark: '#007a99',
    glow: 'rgba(0, 212, 255, 0.4)',
  },

  // Warning - Corrupted gold / tarnished tinsel
  warning: {
    main: '#ffaa00',
    dim: '#cc8800',
    dark: '#996600',
    glow: 'rgba(255, 170, 0, 0.4)',
  },

  // Backgrounds - Void/abyss
  background: {
    void: '#000008', // Near-black with blue tint
    dark: '#0a0a14', // Deep midnight
    medium: '#12121e', // Dark surface
    card: '#1a1a28', // Elevated surface
    elevated: '#222232', // Highest elevation
  },

  // Text hierarchy
  text: {
    primary: '#ffffff',
    secondary: '#b0b0c0',
    muted: '#606070',
    disabled: '#404048',
    inverse: '#000008',
  },

  // Semantic states
  health: {
    full: '#00ff66',
    high: '#88ff00',
    medium: '#ffaa00',
    low: '#ff6600',
    critical: '#ff0033',
    empty: '#330011',
  },

  // UI borders
  border: {
    default: '#2a2a3a',
    subtle: '#1a1a28',
    active: '#00ff66',
    danger: '#cc0033',
    focus: '#00d4ff',
  },

  // Shadows and glows (for StyleSheet)
  shadow: {
    dark: '#000000',
    neonGreen: '#00ff66',
    neonRed: '#ff0033',
    neonBlue: '#00d4ff',
  },
} as const;

/**
 * Dark Yuletide Theme configuration
 */
export const darkYuletideTheme: Theme = {
  name: 'darkYuletide',
  colors: {
    primary: darkYuletideColors.primary.main,
    primaryDim: darkYuletideColors.primary.dim,
    background: darkYuletideColors.background.dark,
    backgroundSecondary: darkYuletideColors.background.card,
    text: darkYuletideColors.text.primary,
    textSecondary: darkYuletideColors.text.secondary,
    accent: darkYuletideColors.accent.main,
    danger: darkYuletideColors.secondary.main,
    warning: darkYuletideColors.warning.main,
    success: darkYuletideColors.primary.main,
  },
  spacing,
  typography,
  borderRadius,
  animation,
};

/**
 * Shadow presets for Dark Yuletide
 */
export const darkYuletideShadows = {
  neonGlow: {
    shadowColor: darkYuletideColors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  dangerGlow: {
    shadowColor: darkYuletideColors.secondary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  frostGlow: {
    shadowColor: darkYuletideColors.accent.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    shadowColor: darkYuletideColors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  elevated: {
    shadowColor: darkYuletideColors.shadow.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

/**
 * Gradient definitions (for use with expo-linear-gradient)
 */
export const darkYuletideGradients = {
  // Primary button gradient
  primaryButton: {
    colors: [darkYuletideColors.primary.main, darkYuletideColors.primary.dim],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Danger gradient
  danger: {
    colors: [darkYuletideColors.secondary.bright, darkYuletideColors.secondary.main],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Background vignette
  vignette: {
    colors: [
      'transparent',
      darkYuletideColors.background.void + '80',
      darkYuletideColors.background.void,
    ],
    start: { x: 0.5, y: 0.5 },
    end: { x: 0, y: 0 },
  },
  // Health bar gradient
  healthBar: {
    colors: [darkYuletideColors.health.full, darkYuletideColors.primary.dim],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  // Frost effect
  frost: {
    colors: [
      darkYuletideColors.accent.glow,
      'transparent',
    ],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;
