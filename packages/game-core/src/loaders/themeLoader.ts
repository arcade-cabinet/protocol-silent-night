/**
 * @fileoverview Loader for theme configurations
 * @module loaders/themeLoader
 *
 * Loads and validates themes.json DDL file with Zod schema validation.
 * Provides type-safe access to lighting, atmosphere, and post-processing configs.
 */

import {
  ThemesSchema,
  type ThemesData,
  type ThemeConfigValidated,
  type LightingConfig,
  type SkyConfig,
  type PostProcessingConfig,
} from '../schemas';
import themesData from '../data/themes.json';

/**
 * Cached validated themes data
 */
let cachedThemes: ThemesData | null = null;

/**
 * Load and validate theme configurations from themes.json
 *
 * @returns Validated themes data record
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const themes = loadThemes();
 * console.log(themes.default.lighting.ambient.intensity); // 0.1
 * ```
 */
export function loadThemes(): ThemesData {
  if (cachedThemes) {
    return cachedThemes;
  }

  cachedThemes = ThemesSchema.parse(themesData);
  return cachedThemes;
}

/**
 * Load a specific theme configuration by name
 *
 * @param name - The theme name to load (default: 'default')
 * @returns The validated theme configuration
 * @throws {ZodError} If validation fails
 * @throws {Error} If theme name not found
 *
 * @example
 * ```typescript
 * const theme = loadThemeByName('default');
 * console.log(theme.sky.starVisibility); // 0.8
 * ```
 */
export function loadThemeByName(name: string = 'default'): ThemeConfigValidated {
  const themes = loadThemes();
  const theme = themes[name];

  if (!theme) {
    throw new Error(`Theme '${name}' not found in themes.json`);
  }

  return theme;
}

/**
 * Load the default theme configuration
 *
 * @returns The validated default theme configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const theme = loadDefaultTheme();
 * console.log(theme.postProcessing.bloom.intensity); // 1.2
 * ```
 */
export function loadDefaultTheme(): ThemeConfigValidated {
  return loadThemeByName('default');
}

/**
 * Load lighting configuration from a theme
 *
 * @param themeName - The theme name (default: 'default')
 * @returns The validated lighting configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const lighting = loadLightingConfig();
 * console.log(lighting.moonlight.color); // '#4455ff'
 * ```
 */
export function loadLightingConfig(themeName: string = 'default'): LightingConfig {
  const theme = loadThemeByName(themeName);
  return theme.lighting;
}

/**
 * Load sky configuration from a theme
 *
 * @param themeName - The theme name (default: 'default')
 * @returns The validated sky configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const sky = loadSkyConfig();
 * console.log(sky.volumetricFog.height); // 20
 * ```
 */
export function loadSkyConfig(themeName: string = 'default'): SkyConfig {
  const theme = loadThemeByName(themeName);
  return theme.sky;
}

/**
 * Load post-processing configuration from a theme
 *
 * @param themeName - The theme name (default: 'default')
 * @returns The validated post-processing configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const postProcessing = loadPostProcessingConfig();
 * console.log(postProcessing.bloom.radius); // 0.5
 * ```
 */
export function loadPostProcessingConfig(
  themeName: string = 'default'
): PostProcessingConfig {
  const theme = loadThemeByName(themeName);
  return theme.postProcessing;
}

/**
 * Get all available theme names
 *
 * @returns Array of theme name identifiers
 *
 * @example
 * ```typescript
 * const names = getThemeNames(); // ['default']
 * ```
 */
export function getThemeNames(): string[] {
  const themes = loadThemes();
  return Object.keys(themes);
}

/**
 * Validate themes data without caching (useful for testing)
 *
 * @param data - Raw data to validate
 * @returns Validated themes data
 * @throws {ZodError} If validation fails
 */
export function validateThemes(data: unknown): ThemesData {
  return ThemesSchema.parse(data);
}

/**
 * Clear the cached themes data (useful for hot reloading)
 */
export function clearThemesCache(): void {
  cachedThemes = null;
}
