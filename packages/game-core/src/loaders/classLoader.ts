/**
 * @fileoverview Loader for player class configurations
 * @module loaders/classLoader
 *
 * Loads and validates classes.json DDL file with Zod schema validation.
 * Provides type-safe access to player class configurations.
 */

import { ClassesSchema, type ClassesData, type PlayerClassConfigValidated } from '../schemas';
import classesData from '../data/classes.json';

/**
 * Cached validated classes data
 */
let cachedClasses: ClassesData | null = null;

/**
 * Load and validate player class configurations from classes.json
 *
 * @returns Validated classes data record
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const classes = loadClasses();
 * const santa = classes.santa;
 * console.log(santa.hp); // 300
 * ```
 */
export function loadClasses(): ClassesData {
  if (cachedClasses) {
    return cachedClasses;
  }

  cachedClasses = ClassesSchema.parse(classesData);
  return cachedClasses;
}

/**
 * Load a specific player class configuration by type
 *
 * @param type - The player class type to load
 * @returns The validated player class configuration
 * @throws {ZodError} If validation fails
 * @throws {Error} If class type not found
 *
 * @example
 * ```typescript
 * const elf = loadClassByType('elf');
 * console.log(elf.speed); // 18
 * ```
 */
export function loadClassByType(
  type: 'santa' | 'elf' | 'bumble'
): PlayerClassConfigValidated {
  const classes = loadClasses();
  const classConfig = classes[type];

  if (!classConfig) {
    throw new Error(`Player class type '${type}' not found in classes.json`);
  }

  return classConfig;
}

/**
 * Get all available player class types
 *
 * @returns Array of available class type identifiers
 *
 * @example
 * ```typescript
 * const types = getClassTypes(); // ['santa', 'elf', 'bumble']
 * ```
 */
export function getClassTypes(): Array<'santa' | 'elf' | 'bumble'> {
  const classes = loadClasses();
  return Object.keys(classes) as Array<'santa' | 'elf' | 'bumble'>;
}

/**
 * Validate classes data without caching (useful for testing)
 *
 * @param data - Raw data to validate
 * @returns Validated classes data
 * @throws {ZodError} If validation fails
 */
export function validateClasses(data: unknown): ClassesData {
  return ClassesSchema.parse(data);
}

/**
 * Clear the cached classes data (useful for hot reloading)
 */
export function clearClassesCache(): void {
  cachedClasses = null;
}
