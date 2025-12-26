/**
 * Skin Selector Component
 * Allows players to select and unlock character skins
 */

import { useGameStore } from '@/store/gameStore';
import { SKIN_UNLOCKS } from '@/data/workshop';
import type { PlayerClassType } from '@/types';
import styles from './SkinSelector.module.css';

interface SkinSelectorProps {
  characterClass: PlayerClassType;
  onClose: () => void;
}

export function SkinSelector({ characterClass, onClose }: SkinSelectorProps) {
  const { metaProgress, spendNicePoints, unlockWeapon, unlockSkin } = useGameStore();

  const skins = SKIN_UNLOCKS.filter(s => s.character === characterClass);
  const unlockedSkins = metaProgress.unlockedSkins;
  const nicePoints = metaProgress.nicePoints;

  const handleSelectSkin = (skinId: string) => {
    const skin = SKIN_UNLOCKS.find(s => s.id === skinId);
    if (!skin) return;
    
    const isUnlocked = unlockedSkins.includes(skinId);

    if (!isUnlocked) {
      // Try to unlock
      if (skin.cost <= nicePoints) {
        if (spendNicePoints(skin.cost)) {
          unlockSkin(skinId);
        }
      }
    } else {
      // Already unlocked, logic for selecting it would go here
      // For now we just unlock
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: overlay is a common pattern for modals
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="button"
      tabIndex={-1}
      aria-label="Close skin selector"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: modal container stops propagation */}
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>SELECT SKIN</h2>
          <div className={styles.points}>
            <span className={styles.pointsLabel}>NICE POINTS:</span>
            <span className={styles.pointsValue}>{nicePoints}</span>
          </div>
        </div>

        <div className={styles.skinGrid}>
          {skins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const canAfford = nicePoints >= skin.cost;

            return (
              <button
                key={skin.id}
                type="button"
                className={`${styles.skinCard} ${isUnlocked ? styles.unlocked : ''} ${
                  !isUnlocked && !canAfford ? styles.locked : ''
                }`}
                onClick={() => handleSelectSkin(skin.id)}
                disabled={!isUnlocked && !canAfford}
              >
                <div className={styles.skinPreview}>
                  {!isUnlocked && <div className={styles.lockIcon}>🔒</div>}
                </div>
                <div className={styles.skinInfo}>
                  <div className={styles.skinName}>{skin.name}</div>
                  {skin.description && (
                    <div className={styles.skinDesc}>{skin.description}</div>
                  )}
                  {!isUnlocked && (
                    <div className={`${styles.skinCost} ${canAfford ? styles.affordable : styles.expensive}`}>
                      {skin.cost} NP
                    </div>
                  )}
                  {isUnlocked && skin.cost > 0 && (
                    <div className={styles.ownedBadge}>UNLOCKED</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button type="button" className={styles.closeButton} onClick={onClose}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
