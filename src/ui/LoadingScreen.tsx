/**
 * Loading Screen Component
 * Initial game loading overlay
 */

import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 1500 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const animationDuration = 500; // CSS transition duration

    // Hide after minimum duration
    const timer = setTimeout(() => {
      setVisible(false);
      // Remove from DOM after fade out animation completes
      setTimeout(() => setMounted(false), animationDuration);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

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
