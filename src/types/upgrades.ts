/**
 * @fileoverview Upgrade registry with all available upgrades
 * @module types/upgrades
 */

import type { PlayerUpgradeStats, Upgrade } from './index';

/**
 * Registry of all available upgrades
 */
export const UPGRADE_REGISTRY: Upgrade[] = [
  // OFFENSIVE UPGRADES
  {
    id: 'damage_boost',
    name: 'Coal Power',
    description: '+20% damage',
    category: 'offensive',
    icon: '💥',
    maxStacks: 5,
    apply: (stats) => ({
      ...stats,
      damageMultiplier: stats.damageMultiplier * 1.2,
    }),
  },
  {
    id: 'fire_rate',
    name: 'Rapid Fire',
    description: '+25% fire rate',
    category: 'offensive',
    icon: '⚡',
    maxStacks: 4,
    apply: (stats) => ({
      ...stats,
      fireRateMultiplier: stats.fireRateMultiplier * 1.25,
    }),
  },
  {
    id: 'projectile_speed',
    name: 'Velocity Boost',
    description: '+30% projectile speed',
    category: 'offensive',
    icon: '🚀',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      projectileSpeedMultiplier: stats.projectileSpeedMultiplier * 1.3,
    }),
  },
  {
    id: 'projectile_size',
    name: 'Large Caliber',
    description: '+40% projectile size',
    category: 'offensive',
    icon: '🎯',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      projectileSizeMultiplier: stats.projectileSizeMultiplier * 1.4,
    }),
  },
  {
    id: 'crit_chance',
    name: 'Precision Strike',
    description: '+15% critical hit chance',
    category: 'offensive',
    icon: '🎲',
    maxStacks: 4,
    apply: (stats) => ({
      ...stats,
      critChance: Math.min(0.75, stats.critChance + 0.15),
    }),
  },
  {
    id: 'crit_damage',
    name: 'Critical Mass',
    description: '+50% critical damage',
    category: 'offensive',
    icon: '💢',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      critDamage: stats.critDamage + 0.5,
    }),
  },
  {
    id: 'piercing',
    name: 'Piercing Rounds',
    description: 'Shots pierce through 1 enemy',
    category: 'offensive',
    icon: '🔱',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      piercingShots: stats.piercingShots + 1,
    }),
  },
  {
    id: 'aoe',
    name: 'Explosive Rounds',
    description: '+2 units explosion radius',
    category: 'offensive',
    icon: '💣',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      aoeRadiusBonus: stats.aoeRadiusBonus + 2,
    }),
  },

  // DEFENSIVE UPGRADES
  {
    id: 'max_hp',
    name: 'Reinforced Armor',
    description: '+50 max HP',
    category: 'defensive',
    icon: '🛡️',
    maxStacks: 5,
    apply: (stats) => ({
      ...stats,
      maxHpBonus: stats.maxHpBonus + 50,
    }),
  },
  {
    id: 'damage_reduction',
    name: 'Hardened Shell',
    description: '+10% damage reduction',
    category: 'defensive',
    icon: '🧱',
    maxStacks: 5,
    apply: (stats) => ({
      ...stats,
      damageReduction: Math.min(0.75, stats.damageReduction + 0.1),
    }),
  },
  {
    id: 'life_steal',
    name: 'Vampiric Rounds',
    description: '8% life steal on hit',
    category: 'defensive',
    icon: '🩸',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      lifeSteal: Math.min(0.5, stats.lifeSteal + 0.08),
    }),
  },
  {
    id: 'regen',
    name: 'Auto-Repair',
    description: '+20 max HP and heal 20 HP',
    category: 'defensive',
    icon: '💚',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      maxHpBonus: stats.maxHpBonus + 20,
    }),
  },

  // UTILITY UPGRADES
  {
    id: 'speed_boost',
    name: 'Afterburners',
    description: '+15% movement speed',
    category: 'utility',
    icon: '👟',
    maxStacks: 4,
    apply: (stats) => ({
      ...stats,
      speedMultiplier: stats.speedMultiplier * 1.15,
    }),
  },
  {
    id: 'xp_boost',
    name: 'Experience Boost',
    description: '+25% XP gain',
    category: 'utility',
    icon: '⭐',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      xpMultiplier: stats.xpMultiplier * 1.25,
    }),
  },
  {
    id: 'double_shot',
    name: 'Dual Wielding',
    description: 'Fires 2 projectiles (balanced with damage split)',
    category: 'utility',
    icon: '🎯',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      // Simulates dual projectile effect through damage increase.
      // Future enhancement: modify bullet spawning logic to fire 2 projectiles with 0.75x damage each.
      damageMultiplier: stats.damageMultiplier * 1.5,
    }),
  },

  // CHRISTMAS-THEMED UPGRADES
  {
    id: 'candy_cane',
    name: 'Candy Cane Rounds',
    description: '+30% damage, shots slow enemies',
    category: 'christmas',
    icon: '🍭',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      damageMultiplier: stats.damageMultiplier * 1.3,
    }),
  },
  {
    id: 'snowflake',
    name: 'Snowflake Shield',
    description: '+30 max HP, +15% damage reduction',
    category: 'christmas',
    icon: '❄️',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      maxHpBonus: stats.maxHpBonus + 30,
      damageReduction: Math.min(0.75, stats.damageReduction + 0.15),
    }),
  },
  {
    id: 'jingle_bells',
    name: 'Jingle Bell Rock',
    description: '+20% fire rate, +10% speed',
    category: 'christmas',
    icon: '🔔',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      fireRateMultiplier: stats.fireRateMultiplier * 1.2,
      speedMultiplier: stats.speedMultiplier * 1.1,
    }),
  },
  {
    id: 'christmas_spirit',
    name: 'Christmas Spirit',
    description: 'Gain all-around +10% boost',
    category: 'christmas',
    icon: '🎄',
    maxStacks: 3,
    apply: (stats) => ({
      ...stats,
      damageMultiplier: stats.damageMultiplier * 1.1,
      fireRateMultiplier: stats.fireRateMultiplier * 1.1,
      speedMultiplier: stats.speedMultiplier * 1.1,
      xpMultiplier: stats.xpMultiplier * 1.1,
    }),
  },
  {
    id: 'gift_box',
    name: 'Gift Box Surprise',
    description: '+50% XP gain, +25% damage',
    category: 'christmas',
    icon: '🎁',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      damageMultiplier: stats.damageMultiplier * 1.25,
      xpMultiplier: stats.xpMultiplier * 1.5,
    }),
  },
  {
    id: 'reindeer_charge',
    name: 'Reindeer Charge',
    description: '+25% speed, +15% damage',
    category: 'christmas',
    icon: '🦌',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      speedMultiplier: stats.speedMultiplier * 1.25,
      damageMultiplier: stats.damageMultiplier * 1.15,
    }),
  },
  {
    id: 'star_topper',
    name: 'Star Topper',
    description: '+20% crit chance, +25% crit damage',
    category: 'christmas',
    icon: '⭐',
    maxStacks: 2,
    apply: (stats) => ({
      ...stats,
      critChance: Math.min(0.75, stats.critChance + 0.2),
      critDamage: stats.critDamage + 0.25,
    }),
  },
];

/**
 * Get initial player upgrade stats
 */
export function getInitialUpgradeStats(): PlayerUpgradeStats {
  return {
    damageMultiplier: 1.0,
    fireRateMultiplier: 1.0,
    speedMultiplier: 1.0,
    maxHpBonus: 0,
    projectileSpeedMultiplier: 1.0,
    projectileSizeMultiplier: 1.0,
    lifeSteal: 0,
    damageReduction: 0,
    aoeRadiusBonus: 0,
    critChance: 0,
    critDamage: 1.5,
    xpMultiplier: 1.0,
    piercingShots: 0,
  };
}

/**
 * Get 3 random upgrades from the registry
 * Excludes upgrades that have reached max stacks
 */
export function getRandomUpgrades(selectedUpgradeIds: string[], count = 3): Upgrade[] {
  // Count occurrences of each upgrade
  const upgradeCounts = selectedUpgradeIds.reduce(
    (acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter out maxed upgrades
  const availableUpgrades = UPGRADE_REGISTRY.filter((upgrade) => {
    const currentStacks = upgradeCounts[upgrade.id] || 0;
    return currentStacks < upgrade.maxStacks;
  });

  // If not enough upgrades, return what we have
  if (availableUpgrades.length <= count) {
    return availableUpgrades;
  }

  // Shuffle and take count upgrades
  const shuffled = [...availableUpgrades].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
