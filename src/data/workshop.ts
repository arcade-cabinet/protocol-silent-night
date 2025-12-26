import type { PermanentUpgradeConfig, SkinConfig } from '../types';

export const SKIN_UNLOCKS: SkinConfig[] = [
  // Mecha-Santa Skins
  {
    id: 'santa-frosty',
    name: 'Frosty Titan',
    cost: 300,
    character: 'santa',
    description: 'Blue/white ice theme',
    colors: {
      fur: {
        base: [0.1, 0.4, 0.8],
        tip: [0.8, 0.9, 1.0],
      },
    },
  },
  {
    id: 'santa-crimson',
    name: 'Crimson Commander',
    cost: 500,
    character: 'santa',
    description: 'Red/gold elite armor',
    colors: {
      primary: 0xaa0000,
      accent: 0xffd700,
    },
  },
  {
    id: 'santa-stealth',
    name: 'Stealth Claus',
    cost: 750,
    character: 'santa',
    description: 'Black ops night ops',
    colors: {
      primary: 0x111111,
      accent: 0x00ffcc,
    },
  },
  // Cyber-Elf Skins
  {
    id: 'elf-neon',
    name: 'Neon Recon',
    cost: 300,
    character: 'elf',
    description: 'Pink/purple cyberpunk',
    colors: {
      primary: 0xff00ff,
      accent: 0x00ffff,
    },
  },
  {
    id: 'elf-arctic',
    name: 'Arctic Scout',
    cost: 500,
    character: 'elf',
    description: 'White camo',
    colors: {
      primary: 0xeeeeee,
      accent: 0x999999,
    },
  },
  {
    id: 'elf-shadow',
    name: 'Shadow Runner',
    cost: 750,
    character: 'elf',
    description: 'Dark tactical gear',
    colors: {
      primary: 0x222222,
      accent: 0xff0044,
    },
  },
  // The Bumble Skins
  {
    id: 'bumble-crystal',
    name: 'Crystal Yeti',
    cost: 300,
    character: 'bumble',
    description: 'Translucent ice',
    colors: {
      fur: {
        base: [0.5, 0.8, 1.0],
        tip: [1.0, 1.0, 1.0],
      },
    },
  },
  {
    id: 'bumble-golden',
    name: 'Golden Guardian',
    cost: 500,
    character: 'bumble',
    description: 'Gold-plated armor',
    colors: {
      primary: 0xffd700,
      accent: 0xffffff,
    },
  },
  {
    id: 'bumble-void',
    name: 'Void Walker',
    cost: 750,
    character: 'bumble',
    description: 'Dark matter aesthetic',
    colors: {
      primary: 0x000000,
      accent: 0x6600ff,
    },
  },
];

export const PERMANENT_UPGRADES: PermanentUpgradeConfig[] = [
  // Tier 1
  {
    id: 'extra-ammo',
    name: 'Extra Ammo',
    cost: 100,
    tier: 1,
    maxLevel: 5,
    description: '+10% magazine size per level',
  },
  {
    id: 'quick-reload',
    name: 'Quick Reload',
    cost: 100,
    tier: 1,
    maxLevel: 5,
    description: '-5% reload time per level',
  },
  {
    id: 'tough-skin',
    name: 'Tough Skin',
    cost: 100,
    tier: 1,
    maxLevel: 5,
    description: '+5 max HP per level',
  },
  {
    id: 'swift-boots',
    name: 'Swift Boots',
    cost: 100,
    tier: 1,
    maxLevel: 5,
    description: '+2% movement speed per level',
  },
  // Tier 2
  {
    id: 'critical-strikes',
    name: 'Critical Strikes',
    cost: 250,
    tier: 2,
    maxLevel: 3,
    description: '+3% crit chance per level (2x damage)',
  },
  {
    id: 'life-steal',
    name: 'Life Steal',
    cost: 250,
    tier: 2,
    maxLevel: 3,
    description: '+1% damage to HP per level',
  },
  {
    id: 'bullet-time',
    name: 'Bullet Time',
    cost: 250,
    tier: 2,
    maxLevel: 3,
    description: '+5% slower enemy projectiles per level',
  },
  {
    id: 'lucky-drops',
    name: 'Lucky Drops',
    cost: 250,
    tier: 2,
    maxLevel: 3,
    description: '+10% item drop rate per level',
  },
  // Tier 3
  {
    id: 'second-chance',
    name: 'Second Chance',
    cost: 500,
    tier: 3,
    maxLevel: 2,
    description: 'Revive once per run with 50% HP',
  },
  {
    id: 'christmas-miracle',
    name: 'Christmas Miracle',
    cost: 500,
    tier: 3,
    maxLevel: 2,
    description: 'Start with full Christmas Spirit meter',
  },
  {
    id: 'double-trouble',
    name: 'Double Trouble',
    cost: 500,
    tier: 3,
    maxLevel: 2,
    description: 'Dual wield (second weapon slot)',
  },
  {
    id: 'boss-slayer',
    name: 'Boss Slayer',
    cost: 500,
    tier: 3,
    maxLevel: 2,
    description: '+25% damage to bosses per level',
  },
];
