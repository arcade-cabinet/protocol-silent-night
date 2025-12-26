/**
 * End Screen Component
 * Displays win/lose state with replay option
 */

import { useGameStore } from '@/store/gameStore';
import styles from './EndScreen.module.css';

export function EndScreen() {
  const { state, stats, highScore, reset } = useGameStore();

  if (state !== 'WIN' && state !== 'GAME_OVER') return null;

  const isWin = state === 'WIN';
  const isNewHighScore = stats.score >= highScore && stats.score > 0;

  const handleReplay = () => {
    reset();
  };

  return (
    <div className={`${styles.screen} ${isWin ? styles.win : styles.lose}`}>
      <h1 className={styles.title}>{isWin ? 'MISSION COMPLETE' : 'OPERATOR DOWN'}</h1>
      <h3 className={styles.subtitle}>
        {isWin ? 'The North Pole is secure.' : 'The threat persists...'}
      </h3>

      {isNewHighScore && <div className={styles.newHighScore}>★ NEW HIGH SCORE ★</div>}

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
          <span className={styles.statLabel}>ENEMIES ELIMINATED</span>
          <span className={styles.statValue}>{stats.kills}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>BOSS DEFEATED</span>
          <span className={styles.statValue}>{stats.bossDefeated ? 'YES' : 'NO'}</span>
        </div>
      </div>

      <button className={styles.btn} onClick={handleReplay} type="button">
        RE-DEPLOY
      </button>
    </div>
  );
}
