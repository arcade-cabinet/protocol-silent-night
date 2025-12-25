/**
 * Boss HUD Component
 * Displays boss health bar when boss is active
 */

import { useGameStore } from '@/store/gameStore';
import styles from './BossHUD.module.css';

export function BossHUD() {
  const { bossActive, bossHp, bossMaxHp, state } = useGameStore();

  if (!bossActive || state === 'WIN' || state === 'GAME_OVER') return null;

  const hpPercent = (bossHp / bossMaxHp) * 100;

  return (
    <div className={styles.bossHud}>
      <div className={styles.label}>⚠ KRAMPUS-PRIME ⚠</div>
      <div className={styles.barWrap}>
        <div className={styles.bossBar} style={{ width: `${hpPercent}%` }} />
      </div>
      <div className={styles.hpText}>
        {bossHp} / {bossMaxHp}
      </div>
    </div>
  );
}
