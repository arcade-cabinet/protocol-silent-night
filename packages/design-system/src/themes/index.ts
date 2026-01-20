/**
 * Theme definitions for Protocol: Silent Night
 *
 * Themes combine tokens into coherent visual styles
 */

import { colors, babylon } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, borderRadius } from '../tokens/spacing';
import { animation } from '../tokens/animation';
import {
  darkYuletideTheme,
  darkYuletideColors,
  darkYuletideShadows,
  darkYuletideGradients,
} from './darkYuletide';

/**
 * Theme type definition
 */
export interface Theme {
  name: string;
  colors: {
    primary: string;
    primaryDim: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    danger: string;
    warning: string;
    success: string;
  };
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  animation: typeof animation;
}

/**
 * Default cyberpunk Christmas theme
 */
export const cyberpunkTheme: Theme = {
  name: 'cyberpunk',
  colors: {
    primary: colors.primary.neon,
    primaryDim: colors.primary.neonDim,
    background: colors.background.dark,
    backgroundSecondary: colors.background.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    accent: colors.primary.neon,
    danger: colors.text.danger,
    warning: colors.text.warning,
    success: colors.primary.neon,
  },
  spacing,
  typography,
  borderRadius,
  animation,
};

/**
 * Festive red variant theme
 */
export const festiveTheme: Theme = {
  name: 'festive',
  colors: {
    primary: '#ff4444',
    primaryDim: '#cc3333',
    background: '#1a0a0a',
    backgroundSecondary: '#221111',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    accent: '#ff4444',
    danger: '#ff6666',
    warning: '#ffcc00',
    success: '#00ff66',
  },
  spacing,
  typography,
  borderRadius,
  animation,
};

/**
 * Ice/winter variant theme
 */
export const iceTheme: Theme = {
  name: 'ice',
  colors: {
    primary: '#66ccff',
    primaryDim: '#4499cc',
    background: '#0a1020',
    backgroundSecondary: '#112233',
    text: '#ffffff',
    textSecondary: '#88aacc',
    accent: '#66ccff',
    danger: '#ff6666',
    warning: '#ffcc00',
    success: '#66ff99',
  },
  spacing,
  typography,
  borderRadius,
  animation,
};

// Dark Yuletide theme (primary game theme)
export {
  darkYuletideTheme,
  darkYuletideColors,
  darkYuletideShadows,
  darkYuletideGradients,
} from './darkYuletide';

/**
 * All available themes
 */
export const themes = {
  cyberpunk: cyberpunkTheme,
  festive: festiveTheme,
  ice: iceTheme,
  darkYuletide: darkYuletideTheme,
} as const;

/**
 * Default theme - Dark Yuletide for production
 */
export const defaultTheme = darkYuletideTheme;

/**
 * Get theme by name
 */
export function getTheme(name: keyof typeof themes): Theme {
  return themes[name] ?? defaultTheme;
}
