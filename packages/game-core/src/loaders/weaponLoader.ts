/**
 * @fileoverview Loader for weapon configurations
 * @module loaders/weaponLoader
 *
 * Loads and validates weapons.json DDL file with Zod schema validation.
 * Provides type-safe access to weapon stats and evolution configs.
 */

import {
  WeaponsSchema,
  type WeaponsData,
  type WeaponConfigValidated,
  type WeaponEvolutionConfigValidated,
  type WeaponId,
  type WeaponEvolutionId,
} from '../schemas';
import weaponsData from '../data/weapons.json';

/**
 * Cached validated weapons data
 */
let cachedWeapons: WeaponsData | null = null;

/**
 * Load and validate weapon configurations from weapons.json
 *
 * @returns Validated weapons data including evolutions
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const weapons = loadWeapons();
 * console.log(weapons.weapons.cannon.damage); // 40
 * console.log(weapons.evolutions['mega-coal-mortar'].minLevel); // 10
 * ```
 */
export function loadWeapons(): WeaponsData {
  if (cachedWeapons) {
    return cachedWeapons;
  }

  cachedWeapons = WeaponsSchema.parse(weaponsData);
  return cachedWeapons;
}

/**
 * Load all weapon configurations (excluding evolutions)
 *
 * @returns Record of weapon ID to configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const weapons = loadAllWeapons();
 * console.log(weapons.smg.rof); // 0.1
 * ```
 */
export function loadAllWeapons(): Record<string, WeaponConfigValidated> {
  const data = loadWeapons();
  return data.weapons;
}

/**
 * Load a specific weapon configuration by ID
 *
 * @param id - The weapon ID to load
 * @returns The validated weapon configuration or undefined if not found
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const cannon = loadWeaponById('cannon');
 * console.log(cannon?.bulletType); // 'cannon'
 * ```
 */
export function loadWeaponById(id: WeaponId | string): WeaponConfigValidated | undefined {
  const weapons = loadAllWeapons();
  return weapons[id];
}

/**
 * Load all weapon evolution configurations
 *
 * @returns Record of evolution ID to configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const evolutions = loadAllEvolutions();
 * console.log(evolutions['plasma-storm'].baseWeapon); // 'smg'
 * ```
 */
export function loadAllEvolutions(): Record<string, WeaponEvolutionConfigValidated> {
  const data = loadWeapons();
  return data.evolutions;
}

/**
 * Load a specific weapon evolution by ID
 *
 * @param id - The evolution ID to load
 * @returns The validated evolution configuration or undefined if not found
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const evolution = loadEvolutionById('supernova-burst');
 * console.log(evolution?.modifiers.projectileCount); // 5
 * ```
 */
export function loadEvolutionById(
  id: WeaponEvolutionId | string
): WeaponEvolutionConfigValidated | undefined {
  const evolutions = loadAllEvolutions();
  return evolutions[id];
}

/**
 * Get evolutions available for a specific base weapon
 *
 * @param baseWeaponId - The base weapon ID to find evolutions for
 * @returns Array of evolution configurations for the base weapon
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const cannonEvolutions = getEvolutionsForWeapon('cannon');
 * // Returns array with mega-coal-mortar config
 * ```
 */
export function getEvolutionsForWeapon(
  baseWeaponId: WeaponId | string
): WeaponEvolutionConfigValidated[] {
  const evolutions = loadAllEvolutions();
  return Object.values(evolutions).filter(
    (evolution) => evolution.baseWeapon === baseWeaponId
  );
}

/**
 * Get all available weapon IDs
 *
 * @returns Array of weapon ID identifiers
 *
 * @example
 * ```typescript
 * const ids = getWeaponIds();
 * // ['cannon', 'smg', 'star', 'snowball', ...]
 * ```
 */
export function getWeaponIds(): string[] {
  const weapons = loadAllWeapons();
  return Object.keys(weapons);
}

/**
 * Get all available evolution IDs
 *
 * @returns Array of evolution ID identifiers
 *
 * @example
 * ```typescript
 * const ids = getEvolutionIds();
 * // ['mega-coal-mortar', 'plasma-storm', 'supernova-burst', ...]
 * ```
 */
export function getEvolutionIds(): string[] {
  const evolutions = loadAllEvolutions();
  return Object.keys(evolutions);
}

/**
 * Get weapons filtered by cost (useful for shop/unlock systems)
 *
 * @param maxCost - Maximum cost to filter by
 * @returns Array of weapon configs within the cost range
 *
 * @example
 * ```typescript
 * const freeWeapons = getWeaponsByCost(0);
 * // Returns cannon, smg, star (cost: 0)
 * ```
 */
export function getWeaponsByCost(maxCost: number): WeaponConfigValidated[] {
  const weapons = loadAllWeapons();
  return Object.values(weapons).filter((weapon) => weapon.cost <= maxCost);
}

/**
 * Validate weapons data without caching (useful for testing)
 *
 * @param data - Raw data to validate
 * @returns Validated weapons data
 * @throws {ZodError} If validation fails
 */
export function validateWeapons(data: unknown): WeaponsData {
  return WeaponsSchema.parse(data);
}

/**
 * Clear the cached weapons data (useful for hot reloading)
 */
export function clearWeaponsCache(): void {
  cachedWeapons = null;
}
