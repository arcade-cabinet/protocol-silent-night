/**
 * Damage Flash Overlay
 * Shows a red flash when player takes damage
 */

import { useGameStore } from '@/store/gameStore';
import styles from './DamageFlash.module.css';

export function DamageFlash() {
  const damageFlash = useGameStore((s) => s.damageFlash);

  if (!damageFlash) return null;

  return <div className={styles.flash} />;
}
