/**
 * HUD Component
 * Displays player health and current objective
 */

import { useGameStore } from '@/store/gameStore';
import { CONFIG } from '@/types';
import styles from './HUD.module.css';

export function HUD() {
  const { state, playerHp, playerMaxHp, stats, runProgress, metaProgress } = useGameStore();

  // Hide HUD on menu and briefing screens
  if (state === 'MENU' || state === 'BRIEFING') return null;

  const hpPercent = (playerHp / playerMaxHp) * 100;
  const xpToNextLevel = runProgress.level * 100;
  const xpPercent = (runProgress.xp / xpToNextLevel) * 100;
  const killsToGo = Math.max(0, CONFIG.WAVE_REQ - stats.kills);

  const getObjectiveText = () => {
    if (state === 'PHASE_1') {
      return killsToGo > 0 ? `ELIMINATE ${killsToGo} MORE GRINCH-BOTS` : 'BOSS INCOMING...';
    }
    if (state === 'PHASE_BOSS') {
      return 'DESTROY KRAMPUS-PRIME';
    }
    if (state === 'WIN') {
      return 'MISSION COMPLETE';
    }
    return 'SYSTEM FAILURE';
  };

  const objective = getObjectiveText();

  return (
    <div className={styles.hud}>
      {/* Health & XP Panel */}
      <div className={styles.panel} style={{ borderColor: '#00ffcc' }}>
        <div className={styles.label}>OPERATOR STATUS</div>
        <div className={styles.barWrap}>
          <div className={styles.hpBar} style={{ width: `${hpPercent}%` }} />
        </div>
        <div className={styles.hpText}>
          HP: {playerHp} / {playerMaxHp}
        </div>

        <div className={styles.label} style={{ marginTop: '10px' }}>
          LEVEL {runProgress.level} PROGRESS
        </div>
        <div className={styles.barWrap} style={{ height: '6px', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
          <div
            className={styles.hpBar}
            style={{
              width: `${xpPercent}%`,
              backgroundColor: '#ffd700',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            }}
          />
        </div>
        <div className={styles.hpText} style={{ color: '#ffd700' }}>
          XP: {runProgress.xp} / {xpToNextLevel}
        </div>
      </div>

      {/* Objective & Currency Panel */}
      <div className={styles.panel} style={{ borderColor: '#ffd700', textAlign: 'right' }}>
        <div className={styles.label}>CURRENT OBJECTIVE</div>
        <div className={styles.value} style={{ color: '#ffd700' }}>
          {objective}
        </div>
        <div className={styles.score}>SCORE: {stats.score}</div>
        <div className={styles.score} style={{ color: '#00ffcc', fontSize: '0.9rem' }}>
          NICE POINTS: {metaProgress.nicePoints}
        </div>
      </div>
    </div>
  );
}
