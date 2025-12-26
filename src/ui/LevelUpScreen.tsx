/**
 * Level Up Screen Component
 * Roguelike upgrade selection when player levels up
 */

import { useGameStore } from '@/store/gameStore';
import type { RoguelikeUpgrade } from '@/types';
import styles from './LevelUpScreen.module.css';

export function LevelUpScreen() {
  const { runProgress, selectLevelUpgrade, state } = useGameStore();

  // Only show during active gameplay with pending level up
  if (!runProgress.pendingLevelUp || (state !== 'PHASE_1' && state !== 'PHASE_BOSS')) {
    return null;
  }

  const getRarityColor = (rarity: RoguelikeUpgrade['rarity']) => {
    switch (rarity) {
      case 'common':
        return '#aaaaaa';
      case 'rare':
        return '#00aaff';
      case 'epic':
        return '#aa00ff';
      case 'legendary':
        return '#ffaa00';
      default:
        return '#ffffff';
    }
  };

  const getCategoryIcon = (category: RoguelikeUpgrade['category']) => {
    switch (category) {
      case 'offensive':
        return '(ATK)';
      case 'defensive':
        return '(DEF)';
      case 'utility':
        return '(UTL)';
      case 'special':
        return '(SPL)';
      default:
        return '';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.levelBadge}>LEVEL {runProgress.level}</div>
          <h2 className={styles.title}>CHOOSE YOUR UPGRADE</h2>
          <p className={styles.subtitle}>Select one enhancement to power up your run</p>
        </div>

        <div className={styles.upgradesGrid}>
          {runProgress.upgradeChoices.map((upgrade) => {
            const currentStacks = runProgress.activeUpgrades[upgrade.id] || 0;
            const rarityColor = getRarityColor(upgrade.rarity);

            return (
              <button
                key={upgrade.id}
                type="button"
                className={styles.upgradeCard}
                style={{ borderColor: rarityColor }}
                onClick={() => selectLevelUpgrade(upgrade.id)}
              >
                <div className={styles.cardGlow} style={{ background: rarityColor }} />

                <div className={styles.iconContainer} style={{ borderColor: rarityColor }}>
                  <span className={styles.icon}>{upgrade.icon}</span>
                </div>

                <div className={styles.rarityBadge} style={{ color: rarityColor }}>
                  {upgrade.rarity.toUpperCase()}
                </div>

                <h3 className={styles.upgradeName} style={{ color: rarityColor }}>
                  {upgrade.name}
                </h3>

                <p className={styles.description}>{upgrade.description}</p>

                <div className={styles.footer}>
                  <span className={styles.category}>{getCategoryIcon(upgrade.category)}</span>
                  {upgrade.maxStacks > 1 && (
                    <span className={styles.stacks}>
                      {currentStacks}/{upgrade.maxStacks}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.currentUpgrades}>
          <span className={styles.currentLabel}>ACTIVE UPGRADES:</span>
          <div className={styles.upgradeIcons}>
            {Object.entries(runProgress.activeUpgrades).map(([id, stacks]) => {
              const upgrade = runProgress.upgradeChoices.find((u) => u.id === id);
              const icon = upgrade?.icon ?? '?';
              const name = upgrade?.name ?? id;
              return (
                <span key={id} className={styles.activeIcon} title={`${name} x${stacks}`}>
                  {icon}
                  {stacks > 1 && <span className={styles.stackCount}>{stacks}</span>}
                </span>
              );
            })}
            {Object.keys(runProgress.activeUpgrades).length === 0 && (
              <span className={styles.noUpgrades}>None yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
