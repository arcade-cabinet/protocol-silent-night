/**
 * Kill Streak Notification
 * Shows kill streak bonuses
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import styles from './KillStreak.module.css';

const STREAK_NAMES = [
  '',
  '',
  'DOUBLE KILL',
  'TRIPLE KILL',
  'MULTI KILL',
  'MEGA KILL',
  'ULTRA KILL',
  'MONSTER KILL',
];

export function KillStreak() {
  const { killStreak, state } = useGameStore();
  const [showStreak, setShowStreak] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (killStreak >= 2 && state !== 'MENU') {
      setCurrentStreak(killStreak);
      setShowStreak(true);

      const timer = setTimeout(() => {
        setShowStreak(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [killStreak, state]);

  if (!showStreak || currentStreak < 2) return null;

  const streakName = STREAK_NAMES[Math.min(currentStreak, STREAK_NAMES.length - 1)];
  const bonus = Math.floor((currentStreak - 1) * 25);

  return (
    <div className={styles.container}>
      <div className={styles.streakName}>{streakName}</div>
      <div className={styles.bonus}>+{bonus}% BONUS</div>
    </div>
  );
}
