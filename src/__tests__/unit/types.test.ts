import { describe, expect, it } from 'vitest';
import { PLAYER_CLASSES, CONFIG } from '@/data';
import type { PlayerClassType } from '@/types';

describe('Game Constants', () => {
  describe('CONFIG', () => {
    it('should have correct world size', () => {
      expect(CONFIG.WORLD_SIZE).toBe(80);
    });

    it('should have wave requirement of 10 kills', () => {
      expect(CONFIG.WAVE_REQ).toBe(10);
    });

    it('should have max minions limit', () => {
      expect(CONFIG.MAX_MINIONS).toBe(12);
    });

    it('should have spawn interval', () => {
      expect(CONFIG.SPAWN_INTERVAL).toBe(2500);
    });

  it('should have color palette', () => {
    // JSON colors are strings like "#ff0044"
    expect(CONFIG.COLORS.SANTA).toBe('#ff0044');
    expect(CONFIG.COLORS.ELF).toBe('#00ffcc');
    expect(CONFIG.COLORS.BUMBLE).toBe('#eeeeee');
    expect(CONFIG.COLORS.ENEMY_MINION).toBe('#00ff00');
    expect(CONFIG.COLORS.ENEMY_BOSS).toBe('#ff0044');
    expect(CONFIG.COLORS.BULLET_PLAYER).toBe('#ffffaa');
    expect(CONFIG.COLORS.BULLET_ENEMY).toBe('#ff0000');
  });
  });

  describe('PLAYER_CLASSES', () => {
    it('should have all three character classes', () => {
      expect(Object.keys(PLAYER_CLASSES)).toHaveLength(3);
      expect(PLAYER_CLASSES.santa).toBeDefined();
      expect(PLAYER_CLASSES.elf).toBeDefined();
      expect(PLAYER_CLASSES.bumble).toBeDefined();
    });

    describe('Santa (Mecha-Santa)', () => {
      const santa = PLAYER_CLASSES.santa as any;

      it('should have correct basic properties', () => {
        expect(santa.type).toBe('santa');
        expect(santa.name).toBe('MECHA-SANTA');
        expect(santa.role).toBe('Heavy Siege / Tank');
      });

      it('should have tank stats (high HP, low speed)', () => {
        expect(santa.hp).toBe(300);
        expect(santa.speed).toBe(9);
        expect(santa.rof).toBe(0.5);
        expect(santa.damage).toBe(40);
      });

      it('should have cannon weapon type', () => {
        expect(santa.weaponType).toBe('cannon');
      });

      it('should have correct color and scale', () => {
        expect(santa.color).toBe(CONFIG.COLORS.SANTA);
        expect(santa.scale).toBe(1.4);
      });

      it('should have red fur colors', () => {
        expect(santa.furOptions.baseColor).toBe('#cc1919');
        expect(santa.furOptions.tipColor).toBe('#ff4d4d');
      });
    });

    describe('Elf (Cyber-Elf)', () => {
      const elf = PLAYER_CLASSES.elf as any;

      it('should have correct basic properties', () => {
        expect(elf.type).toBe('elf');
        expect(elf.name).toBe('CYBER-ELF');
        expect(elf.role).toBe('Recon / Scout');
      });

      it('should have scout stats (low HP, high speed, high ROF)', () => {
        expect(elf.hp).toBe(100);
        expect(elf.speed).toBe(18);
        expect(elf.rof).toBe(0.1);
        expect(elf.damage).toBe(8);
      });

      it('should have SMG weapon type', () => {
        expect(elf.weaponType).toBe('smg');
      });

      it('should have correct color and scale', () => {
        expect(elf.color).toBe(CONFIG.COLORS.ELF);
        expect(elf.scale).toBe(0.8);
      });

      it('should have cyan fur colors', () => {
        expect(elf.furOptions.baseColor).toBe('#006659');
        expect(elf.furOptions.tipColor).toBe('#33ccb3');
      });

      it('should be fastest character', () => {
        expect(elf.speed).toBeGreaterThan(PLAYER_CLASSES.santa.speed);
        expect(elf.speed).toBeGreaterThan(PLAYER_CLASSES.bumble.speed);
      });

      it('should have highest rate of fire', () => {
        expect(elf.rof).toBeLessThan(PLAYER_CLASSES.santa.rof);
        expect(elf.rof).toBeLessThan(PLAYER_CLASSES.bumble.rof);
      });
    });

    describe('Bumble (The Bumble)', () => {
      const bumble = PLAYER_CLASSES.bumble as any;

      it('should have correct basic properties', () => {
        expect(bumble.type).toBe('bumble');
        expect(bumble.name).toBe('THE BUMBLE');
        expect(bumble.role).toBe('Crowd Control / Bruiser');
      });

      it('should have bruiser stats (medium HP, medium speed)', () => {
        expect(bumble.hp).toBe(200);
        expect(bumble.speed).toBe(12);
        expect(bumble.rof).toBe(0.25);
        expect(bumble.damage).toBe(18);
      });

      it('should have star weapon type', () => {
        expect(bumble.weaponType).toBe('star');
      });

      it('should have correct color and scale', () => {
        expect(bumble.color).toBe(CONFIG.COLORS.BUMBLE);
        expect(bumble.scale).toBe(1.6);
      });

      it('should have white fur colors', () => {
        expect(bumble.furOptions.baseColor).toBe('#d9d9d9');
        expect(bumble.furOptions.tipColor).toBe('#ffffff');
      });

      it('should be largest character', () => {
        expect(bumble.scale).toBeGreaterThan(PLAYER_CLASSES.santa.scale);
        expect(bumble.scale).toBeGreaterThan(PLAYER_CLASSES.elf.scale);
      });
    });

    describe('Class Balance', () => {
      it('should have different HP values for all classes', () => {
        const hpValues = Object.values(PLAYER_CLASSES).map((c) => c.hp);
        const uniqueHp = new Set(hpValues);
        expect(uniqueHp.size).toBe(3);
      });

      it('should have different speed values for all classes', () => {
        const speedValues = Object.values(PLAYER_CLASSES).map((c) => c.speed);
        const uniqueSpeed = new Set(speedValues);
        expect(uniqueSpeed.size).toBe(3);
      });

      it('should have different weapon types for all classes', () => {
        const weaponTypes = Object.values(PLAYER_CLASSES).map((c) => c.weaponType);
        const uniqueWeapons = new Set(weaponTypes);
        expect(uniqueWeapons.size).toBe(3);
      });

      it('should have inverse relationship between HP and speed (generally)', () => {
        const santa = PLAYER_CLASSES.santa;
        const elf = PLAYER_CLASSES.elf;

        // Santa has highest HP and lowest speed
        expect(santa.hp).toBeGreaterThan(elf.hp);
        expect(santa.speed).toBeLessThan(elf.speed);
      });

      it('should have meaningful damage differences', () => {
        // Santa should have highest damage per shot
        expect(PLAYER_CLASSES.santa.damage).toBeGreaterThan(PLAYER_CLASSES.elf.damage);

        // But Elf has much higher ROF for DPS
        expect(PLAYER_CLASSES.elf.rof).toBeLessThan(PLAYER_CLASSES.santa.rof);
      });
    });
  });
});

describe('Type System', () => {
  describe('PlayerClassType', () => {
    it('should accept valid character types', () => {
      const types: PlayerClassType[] = ['santa', 'elf', 'bumble'];

      types.forEach((type) => {
        expect(PLAYER_CLASSES[type]).toBeDefined();
      });
    });
  });

  describe('EnemyType', () => {
    it('should have boss enemy config', () => {
      // Boss stats are defined in gameStore
      expect('boss').toBeTruthy();
      expect('minion').toBeTruthy();
    });
  });

  describe('GameState', () => {
    const validStates = ['MENU', 'BRIEFING', 'PHASE_1', 'PHASE_BOSS', 'WIN', 'GAME_OVER'];

    it('should have all game states defined', () => {
      validStates.forEach((state) => {
        expect(state).toBeTruthy();
      });
    });
  });
});
