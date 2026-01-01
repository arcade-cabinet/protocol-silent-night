/**
 * Loading Screen Component
 * Shows while WebGL context and assets are loading
 */

import { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';
import { SeededRandom } from '../types';

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 500 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  // Use a separate RNG instance for UI animations to avoid affecting game state
  const uiRng = useRef(new SeededRandom(42)); // Fixed seed for consistent UI animation
  const startTime = useRef(Date.now());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Simulate loading progress with time-based guarantee
    intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        // Ensure progress correlates with elapsed time to guarantee completion
        const elapsed = Date.now() - startTime.current;
        const minProgress = Math.min(95, (elapsed / minDuration) * 100);
        const randomIncrement = uiRng.current.next() * 15;
        return Math.max(minProgress, prev + randomIncrement);
      });
    }, 100);

    // Hide after minimum duration
    const timer = setTimeout(() => {
      setProgress(100); // Ensure progress is complete
      setIsVisible(false);
    }, minDuration);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timer);
    };
  }, [minDuration]);

  if (!isVisible) return null;

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          PROTOCOL: <span className={styles.accent}>SILENT NIGHT</span>
        </h1>
        <div className={styles.subtitle}>INITIALIZING SYSTEMS</div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <div className={styles.status}>
          {progress < 30 && 'Loading WebGL context...'}
          {progress >= 30 && progress < 60 && 'Initializing game systems...'}
          {progress >= 60 && progress < 90 && 'Preparing operators...'}
          {progress >= 90 && 'Ready for deployment'}
        </div>
      </div>
    </div>
  );
}
