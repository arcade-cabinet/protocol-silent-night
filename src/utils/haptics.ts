/**
 * Haptic Feedback Utility
 * Provides vibration feedback for game events on mobile devices
 */

// Vibration patterns (in milliseconds)
export const HapticPatterns = {
  TAP: 10,
  FIRE_LIGHT: 15,
  FIRE_MEDIUM: 25,
  FIRE_HEAVY: 40,
  DAMAGE_LIGHT: [20, 10, 20],
  DAMAGE_HEAVY: [50, 30, 50],
  ENEMY_HIT: 20,
  ENEMY_DEFEATED: [30, 20, 30],
  BOSS_APPEAR: [100, 50, 100, 50, 100],
  BOSS_HIT: 40,
  BOSS_DEFEATED: [200, 100, 200, 100, 200],
  BUTTON_PRESS: 10,
  CHARACTER_SELECT: 30,
  VICTORY: [100, 50, 100, 50, 150],
  DEFEAT: [200, 100, 200],
  STREAK_DOUBLE: [20, 10, 20],
  STREAK_TRIPLE: [20, 10, 20, 10, 20],
  STREAK_MEGA: [40, 20, 40, 20, 40],
} as const;

export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

export function triggerHaptic(pattern: number | number[]): void {
  if (!isHapticsSupported()) return;
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

export function hapticWeaponFire(characterType: 'santa' | 'elf' | 'bumble'): void {
  const patterns = {
    santa: HapticPatterns.FIRE_HEAVY,
    elf: HapticPatterns.FIRE_LIGHT,
    bumble: HapticPatterns.FIRE_MEDIUM,
  };
  triggerHaptic(patterns[characterType]);
}

export function hapticDamage(damageAmount: number, maxHp: number): void {
  const damagePercent = (damageAmount / maxHp) * 100;
  triggerHaptic(damagePercent > 30 ? HapticPatterns.DAMAGE_HEAVY : HapticPatterns.DAMAGE_LIGHT);
}

export function hapticButton(): void {
  triggerHaptic(HapticPatterns.BUTTON_PRESS);
}

export function hapticKillStreak(streakCount: number): void {
  if (streakCount === 2) triggerHaptic(HapticPatterns.STREAK_DOUBLE);
  else if (streakCount === 3) triggerHaptic(HapticPatterns.STREAK_TRIPLE);
  else if (streakCount >= 5) triggerHaptic(HapticPatterns.STREAK_MEGA);
}
