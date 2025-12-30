/**
 * Weapon HUD Component
 * Shows current weapon and allows switching during gameplay
 */

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { WEAPONS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import styles from './WeaponHUD.module.css';

export function WeaponHUD() {
  const { state, currentWeapon, unlockedWeaponIds, setWeapon } = useGameStore(
    useShallow((state) => ({
      state: state.state,
      currentWeapon: state.currentWeapon,
      unlockedWeaponIds: state.metaProgress.unlockedWeapons,
      setWeapon: state.setWeapon,
    }))
  );

  const currentWeaponConfig = WEAPONS[currentWeapon as keyof typeof WEAPONS];
  const unlockedWeapons = useMemo(
    () =>
      unlockedWeaponIds.map((id) => WEAPONS[id as keyof typeof WEAPONS]).filter(Boolean),
    [unlockedWeaponIds]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9 && num <= unlockedWeapons.length) {
        const weaponToSelect = unlockedWeapons[num - 1];
        if (weaponToSelect) {
          setWeapon(weaponToSelect.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [unlockedWeapons, setWeapon]);

  if (state !== 'PHASE_1' && state !== 'PHASE_BOSS') return null;

  return (
    <div className={styles.weaponHUD}>
      <div className={styles.currentWeapon}>
        <div className={styles.weaponIcon}>{currentWeaponConfig.icon}</div>
        <div className={styles.weaponInfo}>
          <div className={styles.weaponName}>{currentWeaponConfig.name}</div>
          <div className={styles.weaponStats}>
            DMG: {currentWeaponConfig.damage} | ROF: {currentWeaponConfig.rof.toFixed(2)}s
          </div>
        </div>
      </div>

      {unlockedWeapons.length > 1 && (
        <div className={styles.weaponList}>
          {unlockedWeapons.map((weapon, index) => (
            <button
              key={weapon.id}
              type="button"
              className={`${styles.weaponSlot} ${weapon.id === currentWeapon ? styles.active : ''}`}
              onClick={() => setWeapon(weapon.id)}
              title={`${weapon.name} (${index + 1})`}
            >
              <span className={styles.slotNumber}>{index + 1}</span>
              <span className={styles.slotIcon}>{weapon.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
