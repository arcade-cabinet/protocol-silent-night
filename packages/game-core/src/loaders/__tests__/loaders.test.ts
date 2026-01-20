/**
 * @fileoverview Tests for DDL loaders with Zod validation
 */

import {
  loadClasses,
  loadClassByType,
  getClassTypes,
  clearClassesCache,
  loadEnemies,
  loadEnemyByType,
  loadSpawnConfig,
  clearEnemiesCache,
  loadTerrain,
  loadTerrainConfig,
  loadObstacles,
  clearTerrainCache,
  loadThemes,
  loadDefaultTheme,
  loadLightingConfig,
  clearThemesCache,
  loadWeapons,
  loadAllWeapons,
  loadWeaponById,
  loadAllEvolutions,
  getEvolutionsForWeapon,
  clearWeaponsCache,
  clearAllCaches,
} from '../index';

describe('Class Loaders', () => {
  beforeEach(() => {
    clearClassesCache();
  });

  it('should load all classes', () => {
    const classes = loadClasses();
    expect(classes).toBeDefined();
    expect(classes.santa).toBeDefined();
    expect(classes.elf).toBeDefined();
    expect(classes.bumble).toBeDefined();
  });

  it('should load santa class with correct stats', () => {
    const santa = loadClassByType('santa');
    expect(santa.type).toBe('santa');
    expect(santa.name).toBe('MECHA-SANTA');
    expect(santa.hp).toBe(300);
    expect(santa.speed).toBe(9);
    expect(santa.weaponType).toBe('cannon');
  });

  it('should return correct class types', () => {
    const types = getClassTypes();
    expect(types).toContain('santa');
    expect(types).toContain('elf');
    expect(types).toContain('bumble');
  });

  it('should cache loaded data', () => {
    const classes1 = loadClasses();
    const classes2 = loadClasses();
    expect(classes1).toBe(classes2);
  });
});

describe('Enemy Loaders', () => {
  beforeEach(() => {
    clearEnemiesCache();
  });

  it('should load all enemies', () => {
    const enemies = loadEnemies();
    expect(enemies).toBeDefined();
    expect(enemies.minion).toBeDefined();
    expect(enemies.boss).toBeDefined();
    expect(enemies.spawnConfig).toBeDefined();
  });

  it('should load minion with correct stats', () => {
    const minion = loadEnemyByType('minion');
    expect(minion.type).toBe('minion');
    expect(minion.hp).toBe(30);
    expect(minion.pointValue).toBe(10);
  });

  it('should load boss with correct stats', () => {
    const boss = loadEnemyByType('boss');
    expect(boss.type).toBe('boss');
    expect(boss.hp).toBe(1000);
    expect(boss.pointValue).toBe(1000);
  });

  it('should load spawn config', () => {
    const spawn = loadSpawnConfig();
    expect(spawn.initialMinions).toBe(5);
    expect(spawn.hitRadiusBoss).toBe(3.0);
  });
});

describe('Terrain Loaders', () => {
  beforeEach(() => {
    clearTerrainCache();
  });

  it('should load terrain data', () => {
    const terrain = loadTerrain();
    expect(terrain).toBeDefined();
    expect(terrain.terrain).toBeDefined();
    expect(terrain.obstacles).toBeDefined();
  });

  it('should load terrain config', () => {
    const config = loadTerrainConfig();
    expect(config.gridSize).toBe(40);
    expect(config.cubeSize).toBe(2.5);
    expect(config.noiseScale).toBe(0.02);
  });

  it('should load obstacles', () => {
    const obstacles = loadObstacles();
    expect(obstacles.tree).toBeDefined();
    expect(obstacles.tree.type).toBe('tree');
    expect(obstacles.tree.heightRange).toEqual([4, 8]);
  });
});

describe('Theme Loaders', () => {
  beforeEach(() => {
    clearThemesCache();
  });

  it('should load all themes', () => {
    const themes = loadThemes();
    expect(themes).toBeDefined();
    expect(themes.default).toBeDefined();
  });

  it('should load default theme', () => {
    const theme = loadDefaultTheme();
    expect(theme.lighting).toBeDefined();
    expect(theme.sky).toBeDefined();
    expect(theme.postProcessing).toBeDefined();
  });

  it('should load lighting config', () => {
    const lighting = loadLightingConfig();
    expect(lighting.ambient.intensity).toBe(0.1);
    expect(lighting.moonlight.color).toBe('#4455ff');
  });
});

describe('Weapon Loaders', () => {
  beforeEach(() => {
    clearWeaponsCache();
  });

  it('should load all weapons', () => {
    const weapons = loadWeapons();
    expect(weapons).toBeDefined();
    expect(weapons.weapons).toBeDefined();
    expect(weapons.evolutions).toBeDefined();
  });

  it('should load individual weapons', () => {
    const weapons = loadAllWeapons();
    expect(weapons.cannon).toBeDefined();
    expect(weapons.smg).toBeDefined();
    expect(weapons.star).toBeDefined();
  });

  it('should load weapon by ID', () => {
    const cannon = loadWeaponById('cannon');
    expect(cannon).toBeDefined();
    expect(cannon?.name).toBe('Coal Cannon');
    expect(cannon?.damage).toBe(40);
    expect(cannon?.bulletType).toBe('cannon');
  });

  it('should load evolutions', () => {
    const evolutions = loadAllEvolutions();
    expect(evolutions['mega-coal-mortar']).toBeDefined();
    expect(evolutions['plasma-storm']).toBeDefined();
  });

  it('should get evolutions for weapon', () => {
    const cannonEvolutions = getEvolutionsForWeapon('cannon');
    expect(cannonEvolutions.length).toBe(1);
    expect(cannonEvolutions[0].id).toBe('mega-coal-mortar');
  });
});

describe('Cache Management', () => {
  it('should clear all caches', () => {
    // Load data to populate caches
    loadClasses();
    loadEnemies();
    loadTerrain();
    loadThemes();
    loadWeapons();

    // Clear all caches
    clearAllCaches();

    // Verify data can still be loaded (just tests that clear doesn't break anything)
    expect(loadClasses()).toBeDefined();
    expect(loadEnemies()).toBeDefined();
    expect(loadTerrain()).toBeDefined();
    expect(loadThemes()).toBeDefined();
    expect(loadWeapons()).toBeDefined();
  });
});
