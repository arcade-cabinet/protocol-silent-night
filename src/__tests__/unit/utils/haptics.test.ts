import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HapticPatterns,
  isHapticsSupported,
  triggerHaptic,
  hapticWeaponFire,
  hapticDamage,
  hapticButton,
  hapticKillStreak,
} from '../../../utils/haptics';

describe('Haptics Utility', () => {
  let vibrateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock navigator.vibrate
    vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      writable: true,
      configurable: true,
    });
  });

  describe('HapticPatterns', () => {
    it('should define all required patterns', () => {
      expect(HapticPatterns.TAP).toBe(10);
      expect(HapticPatterns.FIRE_LIGHT).toBe(15);
      expect(HapticPatterns.FIRE_MEDIUM).toBe(25);
      expect(HapticPatterns.FIRE_HEAVY).toBe(40);
      expect(HapticPatterns.ENEMY_HIT).toBe(20);
      expect(HapticPatterns.BOSS_HIT).toBe(40);
      expect(HapticPatterns.BUTTON_PRESS).toBe(10);
      expect(HapticPatterns.CHARACTER_SELECT).toBe(30);
    });

    it('should define array patterns for complex haptics', () => {
      expect(HapticPatterns.DAMAGE_LIGHT).toEqual([20, 10, 20]);
      expect(HapticPatterns.DAMAGE_HEAVY).toEqual([50, 30, 50]);
      expect(HapticPatterns.ENEMY_DEFEATED).toEqual([30, 20, 30]);
      expect(HapticPatterns.BOSS_APPEAR).toEqual([100, 50, 100, 50, 100]);
      expect(HapticPatterns.BOSS_DEFEATED).toEqual([200, 100, 200, 100, 200]);
      expect(HapticPatterns.VICTORY).toEqual([100, 50, 100, 50, 150]);
      expect(HapticPatterns.DEFEAT).toEqual([200, 100, 200]);
    });

    it('should define kill streak patterns', () => {
      expect(HapticPatterns.STREAK_DOUBLE).toEqual([20, 10, 20]);
      expect(HapticPatterns.STREAK_TRIPLE).toEqual([20, 10, 20, 10, 20]);
      expect(HapticPatterns.STREAK_MEGA).toEqual([40, 20, 40, 20, 40]);
    });
  });

  describe('isHapticsSupported', () => {
    it('should return true when vibrate API is available', () => {
      expect(isHapticsSupported()).toBe(true);
    });

    it('should return false when vibrate API is not available', () => {
      const originalVibrate = navigator.vibrate;
      // @ts-expect-error - Testing API absence
      delete navigator.vibrate;

      expect(isHapticsSupported()).toBe(false);

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('triggerHaptic', () => {
    it('should trigger single vibration pattern', () => {
      triggerHaptic(50);

      expect(vibrateSpy).toHaveBeenCalledWith(50);
      expect(vibrateSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger array vibration pattern', () => {
      triggerHaptic([100, 50, 100]);

      expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100]);
      expect(vibrateSpy).toHaveBeenCalledTimes(1);
    });

    it('should not throw if vibrate API unavailable', () => {
      const originalVibrate = navigator.vibrate;
      // @ts-expect-error - Testing API absence
      delete navigator.vibrate;

      expect(() => triggerHaptic(50)).not.toThrow();

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });

    it('should handle vibrate API errors gracefully', () => {
      vibrateSpy.mockImplementation(() => {
        throw new Error('Vibration not allowed');
      });

      expect(() => triggerHaptic(50)).not.toThrow();
    });
  });

  describe('hapticWeaponFire', () => {
    it('should trigger heavy haptic for Santa (cannon)', () => {
      hapticWeaponFire('santa');

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.FIRE_HEAVY);
    });

    it('should trigger light haptic for Elf (SMG)', () => {
      hapticWeaponFire('elf');

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.FIRE_LIGHT);
    });

    it('should trigger medium haptic for Bumble (stars)', () => {
      hapticWeaponFire('bumble');

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.FIRE_MEDIUM);
    });
  });

  describe('hapticDamage', () => {
    it('should trigger light haptic for low damage (<30%)', () => {
      hapticDamage(20, 100); // 20% damage

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.DAMAGE_LIGHT);
    });

    it('should trigger light haptic at 30% threshold', () => {
      hapticDamage(30, 100); // Exactly 30%

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.DAMAGE_LIGHT);
    });

    it('should trigger heavy haptic for high damage (>30%)', () => {
      hapticDamage(50, 100); // 50% damage

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.DAMAGE_HEAVY);
    });

    it('should calculate percentage correctly with different maxHp', () => {
      hapticDamage(100, 300); // 33.3% damage

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.DAMAGE_HEAVY);
    });

    it('should handle edge case of 100% damage', () => {
      hapticDamage(100, 100); // 100% damage

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.DAMAGE_HEAVY);
    });
  });

  describe('hapticButton', () => {
    it('should trigger button press haptic', () => {
      hapticButton();

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.BUTTON_PRESS);
    });

    it('should be callable multiple times', () => {
      hapticButton();
      hapticButton();
      hapticButton();

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('hapticKillStreak', () => {
    it('should not trigger haptic for streak of 1', () => {
      hapticKillStreak(1);

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should trigger double pattern for streak of 2', () => {
      hapticKillStreak(2);

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.STREAK_DOUBLE);
    });

    it('should trigger triple pattern for streak of 3', () => {
      hapticKillStreak(3);

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.STREAK_TRIPLE);
    });

    it('should not trigger for streak of 4', () => {
      hapticKillStreak(4);

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should trigger mega pattern for streak of 5', () => {
      hapticKillStreak(5);

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.STREAK_MEGA);
    });

    it('should trigger mega pattern for streak greater than 5', () => {
      hapticKillStreak(10);

      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.STREAK_MEGA);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support rapid fire scenario (multiple weapon fires)', () => {
      hapticWeaponFire('elf');
      hapticWeaponFire('elf');
      hapticWeaponFire('elf');

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
      expect(vibrateSpy).toHaveBeenCalledWith(HapticPatterns.FIRE_LIGHT);
    });

    it('should support combat scenario (damage + kill)', () => {
      hapticDamage(25, 100); // Take light damage
      hapticWeaponFire('santa'); // Fire back
      triggerHaptic(HapticPatterns.ENEMY_DEFEATED); // Kill enemy

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
    });

    it('should support boss battle scenario', () => {
      triggerHaptic(HapticPatterns.BOSS_APPEAR);
      hapticWeaponFire('bumble');
      triggerHaptic(HapticPatterns.BOSS_HIT);
      hapticDamage(50, 300);
      triggerHaptic(HapticPatterns.BOSS_DEFEATED);

      expect(vibrateSpy).toHaveBeenCalledTimes(5);
    });

    it('should support UI interaction scenario', () => {
      hapticButton(); // Open menu
      triggerHaptic(HapticPatterns.CHARACTER_SELECT); // Select character
      hapticButton(); // Start game

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
    });
  });
});
