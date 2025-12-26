/**
 * HUD Component
 * Displays player health and current objective
 */

import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';
import styles from './HUD.module.css';

export function HUD() {
  const { state, playerHp, playerMaxHp, stats } = useGameStore();

  // Hide HUD on menu and briefing screens
  if (state === 'MENU' || state === 'BRIEFING') return null;

  const hpPercent = (playerHp / playerMaxHp) * 100;
  const killsToGo = Math.max(0, CONFIG.WAVE_REQ - stats.kills);

  const objective =
    state === 'PHASE_1'
      ? killsToGo > 0 
        ? `ELIMINATE ${killsToGo} MORE GRINCH-BOTS`
        : 'BOSS INCOMING...'
      : state === 'PHASE_BOSS'
        ? 'DESTROY KRAMPUS-PRIME'
        : state === 'WIN'
          ? 'MISSION COMPLETE'
          : 'SYSTEM FAILURE';

  return (
    <div className={styles.hud}>
      {/* Health Panel */}
      <div className={styles.panel} style={{ borderColor: '#00ffcc' }}>
        <div className={styles.label}>OPERATOR STATUS</div>
        <div className={styles.barWrap}>
          <div
            className={styles.hpBar}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className={styles.hpText}>
          {playerHp} / {playerMaxHp}
        </div>
      </div>

      {/* Objective Panel */}
      <div className={styles.panel} style={{ borderColor: '#ffd700', textAlign: 'right' }}>
        <div className={styles.label}>CURRENT OBJECTIVE</div>
        <div className={styles.value} style={{ color: '#ffd700' }}>
          {objective}
        </div>
        <div className={styles.score}>SCORE: {stats.score}</div>
      </div>
    </div>
  );
}
