/**
 * Weapon Shop Component
 * Shows unlockable weapons and allows purchasing with Nice Points
 */

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { WEAPONS } from '@/data/weapons';
import type { WeaponType } from '@/types';
import styles from './WeaponShop.module.css';

export function WeaponShop() {
  const { state, metaProgress, spendNicePoints, unlockWeapon } = useGameStore();
  const [showShop, setShowShop] = useState(false);

  // Only show shop button on menu
  if (state !== 'MENU') return null;

  // Get all unlockable weapons (cost > 0)
  const unlockableWeapons = Object.values(WEAPONS).filter((w) => w.cost > 0);

  const handleUnlock = (weaponId: WeaponType, cost: number) => {
    if (spendNicePoints(cost)) {
      unlockWeapon(weaponId);
    }
  };

  return (
    <>
      {/* Shop button */}
      <button type="button" className={styles.shopButton} onClick={() => setShowShop(!showShop)}>
        🎁 WEAPON SHOP ({metaProgress.nicePoints} NP)
      </button>

      {/* Shop modal */}
      {showShop && (
        <div className={styles.modal}>
          <div className={styles.shopContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>🎁 WEAPON SHOP</h2>
              <div className={styles.nicePoints}>
                Nice Points: <span className={styles.amount}>{metaProgress.nicePoints}</span>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowShop(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.weaponGrid}>
              {unlockableWeapons.map((weapon) => {
                const isUnlocked = metaProgress.unlockedWeapons.includes(weapon.id);
                const canAfford = metaProgress.nicePoints >= weapon.cost;

                return (
                  <div
                    key={weapon.id}
                    className={`${styles.weaponCard} ${isUnlocked ? styles.unlocked : ''} ${!canAfford && !isUnlocked ? styles.locked : ''}`}
                  >
                    <div className={styles.weaponIcon}>{weapon.icon}</div>
                    <div className={styles.weaponName}>{weapon.name}</div>
                    <div className={styles.weaponDescription}>{weapon.description}</div>
                    <div className={styles.weaponStats}>
                      <div className={styles.stat}>DMG: {weapon.damage}</div>
                      <div className={styles.stat}>ROF: {weapon.rof.toFixed(2)}s</div>
                    </div>
                    {isUnlocked ? (
                      <div className={styles.unlockedBadge}>✓ UNLOCKED</div>
                    ) : (
                      <button
                        type="button"
                        className={styles.buyButton}
                        disabled={!canAfford}
                        onClick={() => handleUnlock(weapon.id, weapon.cost)}
                      >
                        {canAfford ? `UNLOCK (${weapon.cost} NP)` : `LOCKED (${weapon.cost} NP)`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <p>Nice Points are earned by defeating enemies!</p>
              <p>Weapons can be selected during gameplay (1-9 keys)</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
