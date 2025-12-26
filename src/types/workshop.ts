/**
 * Workshop unlock definitions for Santa's Workshop
 */

export interface WeaponUnlock {
  id: string;
  name: string;
  cost: number;
  type: string;
  damage: string;
  fireRate: string;
  special: string;
  flavor: string;
}

export interface SkinUnlock {
  id: string;
  name: string;
  cost: number;
  character: 'santa' | 'elf' | 'bumble';
  description: string;
}

export interface PermanentUpgrade {
  id: string;
  name: string;
  cost: number;
  tier: 1 | 2 | 3;
  maxLevel: number;
  description: string;
}

/**
 * All unlockable weapons
 */
export const WEAPON_UNLOCKS: WeaponUnlock[] = [
  {
    id: 'snowball',
    name: 'Snowball Launcher',
    cost: 500,
    type: 'Projectile',
    damage: '12 per shot',
    fireRate: '0.2s',
    special: 'Freezes enemies for 1s on hit',
    flavor: 'Neon-infused ice cores. Cold never bothered me anyway.',
  },
  {
    id: 'candycane',
    name: 'Candy Cane Staff',
    cost: 750,
    type: 'Melee Sweep',
    damage: '25 per hit',
    fireRate: '0.4s',
    special: '360° attack, heals 5 HP on kill',
    flavor: 'Peppermint-powered beatdown. Festive AND functional.',
  },
  {
    id: 'ornament',
    name: 'Ornament Bomb Launcher',
    cost: 1000,
    type: 'AOE Explosive',
    damage: '50 per explosion',
    fireRate: '1.0s',
    special: '5-unit radius explosion',
    flavor: 'These decorations pack a punch. Handle with care.',
  },
  {
    id: 'lightwhip',
    name: 'Light String Whip',
    cost: 800,
    type: 'Electric Chain',
    damage: '15 per hit, chains to 3 enemies',
    fireRate: '0.3s',
    special: 'Electric arc damage',
    flavor: 'Deck the halls. Wreck the bots.',
  },
  {
    id: 'turret',
    name: 'Gingerbread Turret',
    cost: 1200,
    type: 'Deployable',
    damage: '10 per shot (auto-fire)',
    fireRate: '0.15s (turret)',
    special: 'Lasts 10 seconds, max 2 turrets',
    flavor: 'Set it and forget it. Smart cookies.',
  },
  {
    id: 'jinglebell',
    name: 'Jingle Bell Shotgun',
    cost: 900,
    type: 'Spread Shot',
    damage: '8 x 5 pellets',
    fireRate: '0.6s',
    special: 'Wide spread, close range devastation',
    flavor: 'Ring in the new year with buckshot and bass.',
  },
  {
    id: 'giftbox',
    name: 'Quantum Gift Box',
    cost: 2000,
    type: 'Random',
    damage: 'Varies',
    fireRate: 'Varies',
    special: 'Random weapon effect each shot',
    flavor: "What's inside? Even Santa doesn't know.",
  },
];

/**
 * All unlockable character skins
 */
export const SKIN_UNLOCKS: SkinUnlock[] = [
  // Mecha-Santa Skins
  {
    id: 'santa-frosty',
    name: 'Frosty Titan',
    cost: 300,
    character: 'santa',
    description: 'Blue/white ice theme',
  },
  {
    id: 'santa-crimson',
    name: 'Crimson Commander',
    cost: 500,
    character: 'santa',
    description: 'Red/gold elite armor',
  },
  {
    id: 'santa-stealth',
    name: 'Stealth Claus',
    cost: 750,
    character: 'santa',
    description: 'Black ops night ops',
  },
  // Cyber-Elf Skins
  {
    id: 'elf-neon',
    name: 'Neon Recon',
    cost: 300,
    character: 'elf',
    description: 'Pink/purple cyberpunk',
  },
  {
    id: 'elf-arctic',
    name: 'Arctic Scout',
    cost: 500,
    character: 'elf',
    description: 'White camo',
  },
  {
    id: 'elf-shadow',
    name: 'Shadow Runner',
    cost: 750,
    character: 'elf',
    description: 'Dark tactical gear',
  },
  // The Bumble Skins
  {
    id: 'bumble-crystal',
    name: 'Crystal Yeti',
    cost: 300,
    character: 'bumble',
    description: 'Translucent ice',
  },
  {
    id: 'bumble-golden',
    name: 'Golden Guardian',
    cost: 500,
    character: 'bumble',
    description: 'Gold-plated armor',
  },
  {
    id: 'bumble-void',
    name: 'Void Walker',
    cost: 750,
    character: 'bumble',
    description: 'Dark matter aesthetic',
  },
];

/**
 * All permanent upgrades
 */
export const PERMANENT_UPGRADES: PermanentUpgrade[] = [
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
