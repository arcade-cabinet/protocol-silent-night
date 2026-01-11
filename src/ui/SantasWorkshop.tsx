/**
 * Santa's Workshop Component
 * Main menu hub for spending Nice Points on unlocks
 */

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { AudioManager } from '@/audio/AudioManager';
import { WORKSHOP } from '@/data';
import { useGameStore } from '@/store/gameStore';
import type { WeaponUnlock, SkinConfig, PermanentUpgradeConfig } from '@/types';
import styles from './SantasWorkshop.module.css';

const WEAPON_UNLOCKS = WORKSHOP.weapons as WeaponUnlock[];
const SKIN_UNLOCKS = WORKSHOP.skins as SkinConfig[];
const PERMANENT_UPGRADES = WORKSHOP.upgrades as PermanentUpgradeConfig[];

type TabType = 'weapons' | 'skins' | 'upgrades';
const TABS: TabType[] = ['weapons', 'skins', 'upgrades'];

interface SantasWorkshopProps {
  show: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export function SantasWorkshop({ show, onClose, triggerRef }: SantasWorkshopProps) {
  const { metaProgress, spendNicePoints, unlockWeapon, unlockSkin, upgradePermanent } =
    useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('weapons');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the close button when the workshop opens
    closeBtnRef.current?.focus();

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);

    // Return focus to the trigger button when component unmounts
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
      triggerRef.current?.focus();
    };
  }, [triggerRef]);

  if (!show) return null;

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.indexOf(activeTab);

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % TABS.length;
      changeTab(TABS[nextIndex]);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      changeTab(TABS[prevIndex]);
      tabRefs.current[prevIndex]?.focus();
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    AudioManager.playSFX('ui_select');
  }, [onClose]);

  const handlePurchaseWeapon = (weapon: WeaponUnlock) => {
    if (metaProgress.unlockedWeapons.includes(weapon.id)) return;

    if (spendNicePoints(weapon.cost)) {
      unlockWeapon(weapon.id);
      AudioManager.playSFX('ui_select');
    } else {
      AudioManager.playSFX('ui_select');
    }
  };

  const handlePurchaseSkin = (skin: SkinConfig) => {
    if (metaProgress.unlockedSkins.includes(skin.id)) return;

    if (spendNicePoints(skin.cost)) {
      unlockSkin(skin.id);
      AudioManager.playSFX('ui_select');
    } else {
      AudioManager.playSFX('ui_select');
    }
  };

  const handlePurchaseUpgrade = (upgrade: PermanentUpgradeConfig) => {
    const currentLevel = metaProgress.permanentUpgrades[upgrade.id] || 0;
    if (currentLevel >= upgrade.maxLevel) return;

    if (spendNicePoints(upgrade.cost)) {
      upgradePermanent(upgrade.id);
      AudioManager.playSFX('ui_select');
    } else {
      AudioManager.playSFX('ui_select');
    }
  };

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    AudioManager.playSFX('ui_select');
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <div className={styles.screen}>
      <div
        ref={containerRef}
        className={styles.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workshop-title"
      >
        <div className={styles.header}>
          <h1 id="workshop-title" className={styles.title}>
            Santa's <span className={styles.accent}>Workshop</span>
          </h1>
          <div className={styles.nicePoints}>
            <span className={styles.npLabel}>Nice Points:</span>
            <span className={styles.npValue}>{metaProgress.nicePoints}</span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close Workshop"
          >
            ✕
          </button>
        </div>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Workshop Categories"
          onKeyDown={handleTabKeyDown}
        >
          {TABS.map((tab, index) => (
            <button
              key={tab}
              ref={(el) => (tabRefs.current[index] = el)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              id={`tab-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => changeTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* Weapons Panel */}
          <div
            role="tabpanel"
            id="panel-weapons"
            aria-labelledby="tab-weapons"
            hidden={activeTab !== 'weapons'}
            className={styles.tabPanel}
            tabIndex={0}
          >
            <div className={styles.grid}>
              {WEAPON_UNLOCKS.map((weapon) => {
                const isUnlocked = metaProgress.unlockedWeapons.includes(weapon.id);
                const canAfford = metaProgress.nicePoints >= weapon.cost;

                return (
                  <div
                    key={weapon.id}
                    className={`${styles.card} ${isUnlocked ? styles.cardUnlocked : ''} ${
                      !canAfford && !isUnlocked ? styles.cardLocked : ''
                    }`}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{weapon.name}</h3>
                      <div className={styles.cardCost}>
                        {isUnlocked ? (
                          <span className={styles.unlocked}>✓ UNLOCKED</span>
                        ) : (
                          <span className={styles.cost}>{weapon.cost} NP</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardType}>{weapon.type}</div>
                    <div className={styles.cardStats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Damage:</span> {weapon.damage}
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Fire Rate:</span> {weapon.fireRate}
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Special:</span> {weapon.special}
                      </div>
                    </div>
                    <div className={styles.cardFlavor}>{weapon.flavor}</div>
                    {!isUnlocked && (
                      <button
                        type="button"
                        className={styles.purchaseBtn}
                        onClick={() => handlePurchaseWeapon(weapon)}
                        disabled={!canAfford}
                        aria-label={
                          canAfford
                            ? `Unlock ${weapon.name} for ${weapon.cost} Nice Points`
                            : `Cannot unlock ${weapon.name}, insufficient Nice Points`
                        }
                      >
                        {canAfford ? 'UNLOCK' : 'INSUFFICIENT NP'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skins Panel */}
          <div
            role="tabpanel"
            id="panel-skins"
            aria-labelledby="tab-skins"
            hidden={activeTab !== 'skins'}
            className={styles.tabPanel}
            tabIndex={0}
          >
            <div className={styles.grid}>
              {SKIN_UNLOCKS.map((skin) => {
                const isUnlocked = metaProgress.unlockedSkins.includes(skin.id);
                const canAfford = metaProgress.nicePoints >= skin.cost;

                return (
                  <div
                    key={skin.id}
                    className={`${styles.card} ${isUnlocked ? styles.cardUnlocked : ''} ${
                      !canAfford && !isUnlocked ? styles.cardLocked : ''
                    }`}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{skin.name}</h3>
                      <div className={styles.cardCost}>
                        {isUnlocked ? (
                          <span className={styles.unlocked}>✓ UNLOCKED</span>
                        ) : (
                          <span className={styles.cost}>{skin.cost} NP</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardType}>{skin.character.toUpperCase()} SKIN</div>
                    <div className={styles.cardDescription}>{skin.description}</div>
                    {!isUnlocked && (
                      <button
                        type="button"
                        className={styles.purchaseBtn}
                        onClick={() => handlePurchaseSkin(skin)}
                        disabled={!canAfford}
                        aria-label={
                          canAfford
                            ? `Unlock ${skin.name} for ${skin.cost} Nice Points`
                            : `Cannot unlock ${skin.name}, insufficient Nice Points`
                        }
                      >
                        {canAfford ? 'UNLOCK' : 'INSUFFICIENT NP'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrades Panel */}
          <div
            role="tabpanel"
            id="panel-upgrades"
            aria-labelledby="tab-upgrades"
            hidden={activeTab !== 'upgrades'}
            className={styles.tabPanel}
            tabIndex={0}
          >
            <div className={styles.upgradesGrid}>
              {[1, 2, 3].map((tier) => {
                const tierUpgrades = PERMANENT_UPGRADES.filter((u) => u.tier === tier);
                return (
                  <div key={tier} className={styles.tierSection}>
                    <h2 className={styles.tierTitle}>Tier {tier}</h2>
                    <div className={styles.grid}>
                      {tierUpgrades.map((upgrade) => {
                        const currentLevel = metaProgress.permanentUpgrades[upgrade.id] || 0;
                        const isMaxed = currentLevel >= upgrade.maxLevel;
                        const canAfford = metaProgress.nicePoints >= upgrade.cost;

                        return (
                          <div
                            key={upgrade.id}
                            className={`${styles.card} ${isMaxed ? styles.cardUnlocked : ''} ${
                              !canAfford && !isMaxed ? styles.cardLocked : ''
                            }`}
                          >
                            <div className={styles.cardHeader}>
                              <h3 className={styles.cardTitle}>{upgrade.name}</h3>
                              <div className={styles.cardCost}>
                                {isMaxed ? (
                                  <span className={styles.maxed}>MAX</span>
                                ) : (
                                  <span className={styles.cost}>{upgrade.cost} NP</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.upgradeLevel}>
                              Level: {currentLevel} / {upgrade.maxLevel}
                            </div>
                            <div className={styles.cardDescription}>{upgrade.description}</div>
                            {!isMaxed && (
                              <button
                                type="button"
                                className={styles.purchaseBtn}
                                onClick={() => handlePurchaseUpgrade(upgrade)}
                                disabled={!canAfford}
                                aria-label={
                                  canAfford
                                    ? `Upgrade ${upgrade.name} for ${upgrade.cost} Nice Points`
                                    : `Cannot upgrade ${upgrade.name}, insufficient Nice Points`
                                }
                              >
                                {canAfford ? 'UPGRADE' : 'INSUFFICIENT NP'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkshopButtonProps {
  onOpen: () => void;
}

export const WorkshopButton = forwardRef<HTMLButtonElement, WorkshopButtonProps>(
  ({ onOpen }, ref) => {
    const handleOpen = () => {
      onOpen();
      AudioManager.playSFX('ui_select');
    };

    return (
      <button ref={ref} type="button" className={styles.workshopBtn} onClick={handleOpen}>
        🎄 SANTA'S WORKSHOP
      </button>
    );
  },
);
