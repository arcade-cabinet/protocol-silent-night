/**
 * Santa's Workshop Component
 * Main menu hub for spending Nice Points on unlocks
 */

import { useState, useEffect, useRef } from 'react';
import { AudioManager } from '@/audio/AudioManager';
import { WORKSHOP } from '@/data';
import { useGameStore } from '@/store/gameStore';
import type { WeaponUnlock, SkinConfig, PermanentUpgradeConfig } from '@/types';
import styles from './SantasWorkshop.module.css';

const WEAPON_UNLOCKS = WORKSHOP.weapons as WeaponUnlock[];
const SKIN_UNLOCKS = WORKSHOP.skins as SkinConfig[];
const PERMANENT_UPGRADES = WORKSHOP.upgrades as PermanentUpgradeConfig[];

type TabType = 'weapons' | 'skins' | 'upgrades';

interface SantasWorkshopProps {
  show: boolean;
  onClose: () => void;
}

export function SantasWorkshop({ show, onClose }: SantasWorkshopProps) {
  const { metaProgress, spendNicePoints, unlockWeapon, unlockSkin, upgradePermanent } =
    useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('weapons');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const tabRefs = {
    weapons: useRef<HTMLButtonElement>(null),
    skins: useRef<HTMLButtonElement>(null),
    upgrades: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    tabRefs[activeTab].current?.focus();
  }, [activeTab]);

  useEffect(() => {
    if (show) {
      triggerRef.current = document.activeElement;
      modalRef.current?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }

        // Focus trapping
        if (event.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (triggerRef.current instanceof HTMLElement) {
          triggerRef.current.focus();
        }
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  const handleClose = () => {
    onClose();
    AudioManager.playSFX('ui_select');
  };

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

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const tabs: TabType[] = ['weapons', 'skins', 'upgrades'];
    const currentIndex = tabs.indexOf(activeTab);

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length;
      changeTab(tabs[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      changeTab(tabs[prevIndex]);
    }
  };

  return (
    <div
      className={styles.screen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workshop-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 id="workshop-title" className={styles.title}>
            Santa's <span className={styles.accent}>Workshop</span>
          </h1>
          <div className={styles.nicePoints}>
            <span className={styles.npLabel}>Nice Points:</span>
            <span className={styles.npValue}>{metaProgress.nicePoints}</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close Workshop">
            ✕
          </button>
        </div>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Workshop Categories"
          onKeyDown={handleTabKeyDown}
        >
          <button
            ref={tabRefs.weapons}
            type="button"
            role="tab"
            aria-selected={activeTab === 'weapons'}
            aria-controls="panel-weapons"
            id="tab-weapons"
            tabIndex={activeTab === 'weapons' ? 0 : -1}
            className={`${styles.tab} ${activeTab === 'weapons' ? styles.tabActive : ''}`}
            onClick={() => changeTab('weapons')}
          >
            Weapons
          </button>
          <button
            ref={tabRefs.skins}
            type="button"
            role="tab"
            aria-selected={activeTab === 'skins'}
            aria-controls="panel-skins"
            id="tab-skins"
            tabIndex={activeTab === 'skins' ? 0 : -1}
            className={`${styles.tab} ${activeTab === 'skins' ? styles.tabActive : ''}`}
            onClick={() => changeTab('skins')}
          >
            Skins
          </button>
          <button
            ref={tabRefs.upgrades}
            type="button"
            role="tab"
            aria-selected={activeTab === 'upgrades'}
            aria-controls="panel-upgrades"
            id="tab-upgrades"
            tabIndex={activeTab === 'upgrades' ? 0 : -1}
            className={`${styles.tab} ${activeTab === 'upgrades' ? styles.tabActive : ''}`}
            onClick={() => changeTab('upgrades')}
          >
            Upgrades
          </button>
        </div>

        <div className={styles.content}>
          {/* Weapons Panel */}
          <div
            role="tabpanel"
            id="panel-weapons"
            aria-labelledby="tab-weapons"
            hidden={activeTab !== 'weapons'}
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
                          isUnlocked
                            ? `Weapon ${weapon.name} already unlocked`
                            : canAfford
                              ? `Unlock ${weapon.name} for ${weapon.cost} Nice Points`
                              : `Cannot afford to unlock ${weapon.name}, cost is ${weapon.cost} Nice Points`
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
                          isUnlocked
                            ? `Skin ${skin.name} already unlocked`
                            : canAfford
                              ? `Unlock ${skin.name} for ${skin.cost} Nice Points`
                              : `Cannot afford to unlock ${skin.name}, cost is ${skin.cost} Nice Points`
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
                                  isMaxed
                                    ? `Upgrade ${upgrade.name} is fully maxed out`
                                    : canAfford
                                      ? `Upgrade ${upgrade.name} for ${upgrade.cost} Nice Points`
                                      : `Cannot afford to upgrade ${upgrade.name}, cost is ${upgrade.cost} Nice Points`
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

export function WorkshopButton({ onOpen }: WorkshopButtonProps) {
  const handleOpen = () => {
    onOpen();
    AudioManager.playSFX('ui_select');
  };

  return (
    <button type="button" className={styles.workshopBtn} onClick={handleOpen}>
      🎄 SANTA'S WORKSHOP
    </button>
  );
}
