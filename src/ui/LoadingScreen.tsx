/**
 * Loading Screen Component
 * Initial game loading overlay
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 1500 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const { state } = useGameStore();

  useEffect(() => {
    // Only show during initial load (MENU) or explicit loading states
    // Hide immediately when transitioning to any other state
    if (state !== 'MENU' && state !== 'LOADING') {
      const animationDuration = 500; // CSS transition duration

      // Immediately start fade out
      setVisible(false);
      // Remove from DOM after fade out animation completes
      const timer = setTimeout(() => setMounted(false), animationDuration);

      return () => clearTimeout(timer);
    }
  }, [state, minDuration]);

  if (!mounted) return null;

  return (
    <div className={`${styles.screen} ${!visible ? styles.hidden : ''}`}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.icon}>🎄</div>
          <div className={styles.title}>PROTOCOL: SILENT NIGHT</div>
        </div>
        <div className={styles.loader}>
          <div className={styles.bar} />
        </div>
        <div className={styles.status}>INITIALIZING SYSTEMS...</div>
      </div>
    </div>
  );
}
