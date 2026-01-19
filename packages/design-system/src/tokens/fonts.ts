/**
 * Font configuration for Protocol: Silent Night
 *
 * Uses Google Fonts via expo-google-fonts:
 * - Orbitron: Cyberpunk headers and titles
 * - Share Tech Mono: Terminal/HUD text
 * - Rajdhani: Body text and UI elements
 *
 * Dark Yuletide Theme Typography:
 * - Angular, industrial fonts for cyberpunk feel
 * - Monospace for terminal/hacker aesthetic
 * - High contrast with neon accents
 */

/**
 * Font family definitions
 * These map to the fonts loaded via expo-google-fonts
 */
export const fontFamily = {
  /** Primary display font - angular, futuristic */
  display: 'Orbitron_700Bold',
  displayMedium: 'Orbitron_500Medium',
  displayLight: 'Orbitron_400Regular',

  /** Monospace font - terminal/hacker aesthetic */
  mono: 'ShareTechMono_400Regular',

  /** Body font - readable but stylized */
  body: 'Rajdhani_500Medium',
  bodyBold: 'Rajdhani_700Bold',
  bodyLight: 'Rajdhani_400Regular',

  /** System fallbacks */
  system: 'System',
  systemMono: 'Courier',
} as const;

/**
 * Font sizes for different use cases
 */
export const fontSizes = {
  // Display sizes
  hero: 64,
  title: 48,
  heading1: 36,
  heading2: 28,
  heading3: 24,

  // Body sizes
  large: 18,
  medium: 16,
  small: 14,
  tiny: 12,
  micro: 10,

  // HUD sizes
  hudLarge: 20,
  hudMedium: 16,
  hudSmall: 12,
} as const;

/**
 * Line heights
 */
export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

/**
 * Letter spacing presets
 */
export const letterSpacings = {
  tight: -0.5,
  normal: 0,
  wide: 2,
  extraWide: 4,
  display: 6,
} as const;

/**
 * Text style presets combining font, size, and spacing
 */
export const textStyles = {
  // Display styles
  heroTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSizes.hero,
    letterSpacing: letterSpacings.display,
    lineHeight: lineHeights.tight,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSizes.title,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.tight,
  },
  heading1: {
    fontFamily: fontFamily.display,
    fontSize: fontSizes.heading1,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.tight,
  },
  heading2: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSizes.heading2,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.normal,
  },
  heading3: {
    fontFamily: fontFamily.displayLight,
    fontSize: fontSizes.heading3,
    letterSpacing: letterSpacings.normal,
    lineHeight: lineHeights.normal,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSizes.large,
    letterSpacing: letterSpacings.normal,
    lineHeight: lineHeights.relaxed,
  },
  bodyMedium: {
    fontFamily: fontFamily.body,
    fontSize: fontSizes.medium,
    letterSpacing: letterSpacings.normal,
    lineHeight: lineHeights.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.bodyLight,
    fontSize: fontSizes.small,
    letterSpacing: letterSpacings.normal,
    lineHeight: lineHeights.normal,
  },

  // Terminal/HUD styles
  terminal: {
    fontFamily: fontFamily.mono,
    fontSize: fontSizes.medium,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.relaxed,
  },
  hudLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSizes.hudSmall,
    letterSpacing: letterSpacings.extraWide,
    lineHeight: lineHeights.tight,
  },
  hudValue: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSizes.hudLarge,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.tight,
  },

  // Button styles
  buttonLarge: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSizes.large,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.tight,
  },
  buttonMedium: {
    fontFamily: fontFamily.body,
    fontSize: fontSizes.medium,
    letterSpacing: letterSpacings.wide,
    lineHeight: lineHeights.tight,
  },
  buttonSmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSizes.small,
    letterSpacing: letterSpacings.normal,
    lineHeight: lineHeights.tight,
  },
} as const;

/**
 * Combined fonts export
 */
export const fonts = {
  family: fontFamily,
  sizes: fontSizes,
  lineHeights,
  letterSpacings,
  styles: textStyles,
} as const;
