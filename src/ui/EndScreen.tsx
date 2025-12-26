/**
 * End Screen Component
 * Displays win/lose state with run summary and replay option
 */

import { useGameStore } from '@/store/gameStore';
import { ROGUELIKE_UPGRADES } from '@/data';
import styles from './EndScreen.module.css';

export function EndScreen() {
  const { state, stats, highScore, reset, runProgress, metaProgress } = useGameStore();

  if (state !== 'WIN' && state !== 'GAME_OVER') return null;

  const isWin = state === 'WIN';
  const isNewHighScore = stats.score >= highScore && stats.score > 0;
  const activeUpgradeIds = Object.keys(runProgress.activeUpgrades);

  const handleReplay = () => {
    reset();
  };

  return (
    <div className={`${styles.screen} ${isWin ? styles.win : styles.lose}`}>
      <h1 className={styles.title}>{isWin ? 'MISSION COMPLETE' : 'OPERATOR DOWN'}</h1>
      <h3 className={styles.subtitle}>
        {isWin ? 'Krampus-Prime has been neutralized. The North Pole is secure.' : 'The threat persists... Krampus grows stronger.'}
      </h3>

      {isNewHighScore && <div className={styles.newHighScore}>NEW HIGH SCORE</div>}

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>FINAL SCORE</span>
          <span className={styles.statValue}>{stats.score}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>HIGH SCORE</span>
          <span className={styles.statValue} style={{ color: '#ffd700' }}>
            {highScore}
          </span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>LEVEL REACHED</span>
          <span className={styles.statValue}>{runProgress.level}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>ENEMIES ELIMINATED</span>
          <span className={styles.statValue}>{stats.kills}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>KRAMPUS DEFEATED</span>
          <span className={styles.statValue} style={{ color: stats.bossDefeated ? '#00ff66' : '#ff3333' }}>
            {stats.bossDefeated ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      {/* Show collected upgrades */}
      {activeUpgradeIds.length > 0 && (
        <div className={styles.upgradesSection}>
          <div className={styles.upgradesLabel}>COLLECTED UPGRADES</div>
          <div className={styles.upgradesGrid}>
            {activeUpgradeIds.map((id) => {
              const upgrade = ROGUELIKE_UPGRADES.find((u) => u.id === id);
              const stacks = runProgress.activeUpgrades[id];
              if (!upgrade) return null;
              return (
                <div key={id} className={styles.upgradeItem}>
                  <span className={styles.upgradeIcon}>{upgrade.icon}</span>
                  <span className={styles.upgradeName}>{upgrade.name}</span>
                  {stacks > 1 && <span className={styles.upgradeStacks}>x{stacks}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nice points earned */}
      <div className={styles.nicePoints}>
        <span className={styles.npLabel}>NICE POINTS TOTAL:</span>
        <span className={styles.npValue}>{metaProgress.nicePoints}</span>
      </div>

      <button className={styles.btn} onClick={handleReplay} type="button">
        {isWin ? 'PLAY AGAIN' : 'RE-DEPLOY'}
      </button>
    </div>
  );
}
