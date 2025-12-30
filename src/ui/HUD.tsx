import { CONFIG, ROGUELIKE_UPGRADES } from '@/data';
import { useGameStoreShallow } from '@/store/useGameStoreShallow';
import styles from './HUD.module.css';

export function HUD() {
  const { state, playerHp, playerMaxHp, stats, runProgress, metaProgress } = useGameStoreShallow(
    (state) => ({
      state: state.state,
      playerHp: state.playerHp,
      playerMaxHp: state.playerMaxHp,
      stats: state.stats,
      runProgress: state.runProgress,
      metaProgress: state.metaProgress,
    })
  );

  // Hide HUD on menu and briefing screens
  if (state === 'MENU' || state === 'BRIEFING') return null;

  const hpPercent = (playerHp / playerMaxHp) * 100;
  const hpColor = hpPercent > 60 ? '#00ff66' : hpPercent > 30 ? '#ffaa00' : '#ff3333';
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
  const activeUpgradeIds = Object.keys(runProgress.activeUpgrades);

  return (
    <div className={styles.hud}>
      {/* Health & XP Panel */}
      <div className={styles.panel} style={{ borderColor: '#00ffcc' }}>
        <div className={styles.label}>OPERATOR STATUS</div>
        <div
          className={styles.barWrap}
          role="progressbar"
          aria-label="Health"
          aria-valuenow={Math.floor(playerHp)}
          aria-valuemin={0}
          aria-valuemax={playerMaxHp}
        >
          <div
            className={styles.hpBar}
            style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
          />
        </div>
        <div className={styles.hpText} style={{ color: hpColor }}>
          HP: {Math.floor(playerHp)} / {playerMaxHp}
        </div>

        <div className={styles.label} style={{ marginTop: '10px' }}>
          LEVEL {runProgress.level}
        </div>
        <div
          className={styles.barWrap}
          style={{ height: '6px', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
          role="progressbar"
          aria-label="Experience"
          aria-valuenow={runProgress.xp}
          aria-valuemin={0}
          aria-valuemax={xpToNextLevel}
        >
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

        {/* Active Upgrades */}
        {activeUpgradeIds.length > 0 && (
          <div className={styles.upgradesRow}>
            {activeUpgradeIds.slice(0, 6).map((id) => {
              const upgrade = ROGUELIKE_UPGRADES.find((u) => u.id === id);
              const stacks = runProgress.activeUpgrades[id];
              return (
                <span key={id} className={styles.upgradeIcon} title={upgrade?.name || id}>
                  {upgrade?.icon || '?'}
                  {stacks > 1 && <span className={styles.stackBadge}>{stacks}</span>}
                </span>
              );
            })}
            {activeUpgradeIds.length > 6 && (
              <span className={styles.moreUpgrades}>+{activeUpgradeIds.length - 6}</span>
            )}
          </div>
        )}
      </div>

      {/* Objective & Stats Panel */}
      <div className={styles.panel} style={{ borderColor: '#ffd700', textAlign: 'right' }}>
        <div className={styles.label}>CURRENT OBJECTIVE</div>
        <div className={styles.value} style={{ color: '#ffd700' }}>
          {objective}
        </div>
        <div className={styles.statsRow}>
          <span className={styles.stat}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{stats.score}</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>KILLS</span>
            <span className={styles.statValue}>{stats.kills}</span>
          </span>
        </div>
        <div
          className={styles.score}
          style={{ color: '#00ffcc', fontSize: '0.85rem', marginTop: '8px' }}
        >
          NICE POINTS: {metaProgress.nicePoints}
        </div>
      </div>
    </div>
  );
}
