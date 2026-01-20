/**
 * @protocol-silent-night/design-system
 *
 * Shared design tokens and theming for Protocol: Silent Night
 *
 * @example
 * ```ts
 * import { colors, spacing, typography } from '@protocol-silent-night/design-system';
 * import { cyberpunkTheme } from '@protocol-silent-night/design-system/themes';
 * import { detectFoldableState } from '@protocol-silent-night/design-system/foldable';
 * ```
 */

// Re-export all tokens
export * from './tokens';

// Re-export themes
export * from './themes';

// Re-export foldable utilities
export * from './foldable';
