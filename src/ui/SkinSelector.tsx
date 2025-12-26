/**
 * Skin Selector Component
 * Allows players to select and unlock character skins
 */

import { useGameStore } from '@/store/gameStore';
import {
  CHARACTER_SKINS,
  type PlayerClassType,
  type SkinId,
  getSkinsForCharacter,
} from '@/types';
import styles from './SkinSelector.module.css';

interface SkinSelectorProps {
  characterClass: PlayerClassType;
  onClose: () => void;
}

export function SkinSelector({ characterClass, onClose }: SkinSelectorProps) {
  const { selectedSkin, selectSkin, metaProgress, spendNicePoints, unlockSkin } = useGameStore();

  const skins = getSkinsForCharacter(characterClass);
  const unlockedSkins = metaProgress.unlockedSkins;
  const nicePoints = metaProgress.nicePoints;

  const handleSelectSkin = (skinId: SkinId) => {
    const skin = CHARACTER_SKINS[skinId];
    const isUnlocked = unlockedSkins.includes(skinId);

    if (!isUnlocked) {
      // Try to unlock
      if (skin.cost <= nicePoints) {
        if (spendNicePoints(skin.cost)) {
          unlockSkin(skinId);
          selectSkin(skinId);
        }
      }
    } else {
      // Already unlocked, just select
      selectSkin(skinId);
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
            const isSelected = selectedSkin === skin.id;
            const canAfford = nicePoints >= skin.cost;

            return (
              <button
                key={skin.id}
                type="button"
                className={`${styles.skinCard} ${isSelected ? styles.selected : ''} ${
                  !isUnlocked && !canAfford ? styles.locked : ''
                }`}
                onClick={() => handleSelectSkin(skin.id)}
                disabled={!isUnlocked && !canAfford}
              >
                <div className={styles.skinPreview} style={{ backgroundColor: `#${skin.color.toString(16).padStart(6, '0')}` }}>
                  {!isUnlocked && <div className={styles.lockIcon}>🔒</div>}
                  {isSelected && <div className={styles.checkIcon}>✓</div>}
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
