/**
 * Level Up Screen Component
 * Displays 3 random upgrade choices when player levels up
 */

import { useGameStore } from '@/store/gameStore';
import styles from './LevelUpScreen.module.css';

export function LevelUpScreen() {
  const { state, levelUpChoices, selectLevelUpgrade, runProgress } = useGameStore();

  if (state !== 'LEVEL_UP') return null;

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          LEVEL <span className={styles.accent}>{runProgress.level}</span>
        </h1>
        <h3 className={styles.subtitle}>SELECT AN UPGRADE</h3>

        <div className={styles.upgradeContainer}>
          {levelUpChoices.map((upgrade) => (
            <button
              key={upgrade.id}
              type="button"
              className={`${styles.upgradeCard} ${styles[upgrade.category]}`}
              onClick={() => selectLevelUpgrade(upgrade.id)}
            >
              <div className={styles.icon}>{upgrade.icon}</div>
              <div className={styles.cardTitle}>{upgrade.name}</div>
              <div className={styles.cardCategory}>{upgrade.category.toUpperCase()}</div>
              <div className={styles.cardDescription}>{upgrade.description}</div>
            </button>
          ))}
        </div>

        <div className={styles.instructions}>Click to select an upgrade and continue</div>
      </div>
    </div>
  );
}
