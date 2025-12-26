import type { EnemyConfig, EnemyType } from '../types';
import { CONFIG } from './config';

export const ENEMIES: Record<EnemyType, EnemyConfig> = {
  minion: {
    type: 'minion',
    hp: 30,
    speed: 4, // Base speed, often randomized in code (e.g., 4-6)
    damage: 1,
    pointValue: 10,
  },
  boss: {
    type: 'boss',
    hp: 1000,
    speed: 3,
    damage: 5,
    pointValue: 1000,
  },
};

export const ENEMY_SPAWN_CONFIG = {
  initialMinions: 5,
  minionSpawnRadiusMin: 25,
  minionSpawnRadiusMax: 35,
  damageCooldown: 500,
  knockbackForce: -2,
  hitRadiusMinion: 1.5,
  hitRadiusBoss: 3.0,
};
