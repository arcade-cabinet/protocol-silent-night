/**
 * Boss Vignette Component
 * Adds a pulsing red vignette during boss phase for tension
 */

import { useGameStore } from '@/store/gameStore';
import styles from './BossVignette.module.css';

export function BossVignette() {
  const { bossActive, bossHp, bossMaxHp, state } = useGameStore();

  if (!bossActive || state === 'WIN' || state === 'GAME_OVER') return null;

  // Increase intensity as boss health decreases
  const intensity = 1 - (bossHp / bossMaxHp);
  const opacity = 0.15 + intensity * 0.25;

  return (
    <div 
      className={styles.vignette} 
      style={{ '--intensity': opacity } as React.CSSProperties}
    />
  );
}
