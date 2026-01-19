/**
 * Task Registry
 *
 * Loads and manages task definitions from JSON files.
 * Provides task lookup and dependency resolution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskDefinition } from './types';

// ============================================================================
// REGISTRY
// ============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

class TaskRegistry {
  private definitions: Map<string, TaskDefinition> = new Map();
  private loaded = false;

  /**
   * Load all task definitions from the definitions directory
   */
  load(): void {
    if (this.loaded) return;

    const files = fs.readdirSync(DEFINITIONS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(DEFINITIONS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const definition = JSON.parse(content) as TaskDefinition;

      this.definitions.set(definition.type, definition);
    }

    this.loaded = true;
  }

  /**
   * Get a task definition by type
   */
  get(type: string): TaskDefinition | undefined {
    this.load();
    return this.definitions.get(type);
  }

  /**
   * Get all registered task definitions
   */
  getAll(): TaskDefinition[] {
    this.load();
    return Array.from(this.definitions.values());
  }

  /**
   * Get task types in dependency order for a given end goal
   */
  getDependencyChain(targetType: string): string[] {
    this.load();

    const chain: string[] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>(); // Track current recursion stack for cycle detection

    const visit = (type: string): void => {
      if (visited.has(type)) return;

      if (inStack.has(type)) {
        throw new Error(`Circular dependency detected involving task: ${type}`);
      }

      inStack.add(type);

      const def = this.definitions.get(type);
      if (!def) {
        throw new Error(`Unknown task type: ${type}`);
      }

      // Visit dependencies first
      for (const dep of def.dependsOn ?? []) {
        visit(dep);
      }

      inStack.delete(type);
      visited.add(type);
      chain.push(type);
    };

    visit(targetType);
    return chain;
  }

  /**
   * Register a task definition programmatically
   */
  register(definition: TaskDefinition): void {
    this.definitions.set(definition.type, definition);
  }
}

// Singleton instance
export const taskRegistry = new TaskRegistry();

// ============================================================================
// ANIMATION LIBRARY
// ============================================================================

interface AnimationLibrary {
  byPath: Record<string, number>;
  byName: Record<string, number>;
}

/**
 * Load animation library from JSON
 * Provides both byName (e.g., "Combat_Stance" -> 89) and byPath (e.g., "Fighting.AttackingwithWeapon.Combat_Stance" -> 89)
 */
function loadAnimationIds(): Record<string, number> {
  const libraryPath = path.join(DEFINITIONS_DIR, 'animation-library.json');

  // Return empty if file doesn't exist (run sync-animations to populate)
  if (!fs.existsSync(libraryPath)) {
    console.warn('Animation library not found. Run: pnpm generate sync-animations');
    return {};
  }

  const content = fs.readFileSync(libraryPath, 'utf-8');
  const library = JSON.parse(content) as AnimationLibrary;

  // Return byName for simple lookups - user can access byPath via getAnimationLibrary()
  return library.byName ?? {};
}

/**
 * Get the full animation library including byPath for qualified lookups
 */
export function getAnimationLibrary(): AnimationLibrary | null {
  const libraryPath = path.join(DEFINITIONS_DIR, 'animation-library.json');
  if (!fs.existsSync(libraryPath)) return null;
  return JSON.parse(fs.readFileSync(libraryPath, 'utf-8')) as AnimationLibrary;
}

// Lazy-loaded animation IDs
let _animationIds: Record<string, number> | null = null;

/**
 * Animation action IDs from Meshy's animation library
 * Loaded from animation-library.json
 * @see https://docs.meshy.ai/en/api/animation-library
 */
export function getAnimationIds(): Record<string, number> {
  if (!_animationIds) {
    _animationIds = loadAnimationIds();
  }
  return _animationIds;
}

// For backwards compatibility - lazy proxy
export const ANIMATION_IDS: Record<string, number> = new Proxy({}, {
  get(_, prop: string) {
    return getAnimationIds()[prop];
  },
  has(_, prop: string) {
    return prop in getAnimationIds();
  },
  ownKeys() {
    return Object.keys(getAnimationIds());
  },
  getOwnPropertyDescriptor(_, prop: string) {
    const ids = getAnimationIds();
    if (prop in ids) {
      return { configurable: true, enumerable: true, value: ids[prop] };
    }
    return undefined;
  },
});

export type AnimationType = string;
