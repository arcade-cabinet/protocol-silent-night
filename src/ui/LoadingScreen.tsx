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
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  // Use a separate RNG instance for UI animations to avoid affecting game state
  const uiRng = useRef(new SeededRandom(42)); // Fixed seed for consistent UI animation
  const startTime = useRef(Date.now());

  // Detect E2E testing environment - skip fade animation for faster test execution
  const isE2ETesting = typeof window !== 'undefined' && (window as any).__E2E_TESTING__;
  const fadeOutDuration = isE2ETesting ? 0 : 300; // No fade in E2E mode


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

    // Start fade out when minDuration is reached
    const fadeOutTimer = setTimeout(() => {
      setProgress(100); // Ensure progress is complete
      setIsFadingOut(true);
    }, minDuration);

    // Hide after fade out animation completes
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, minDuration + fadeOutDuration);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [minDuration, fadeOutDuration]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.screen} ${isFadingOut ? styles.fadingOut : ''}`}
      style={{
        // Explicitly disable pointer events inline when fading out to ensure immediate effect
        // This prevents race conditions where CSS class updates don't apply fast enough
        pointerEvents: isFadingOut ? 'none' : 'auto',
        // In E2E mode, disable transition to remove element instantly
        transition: isE2ETesting ? 'none' : undefined,
        // In E2E mode, set opacity to 0 immediately when fading out
        opacity: isE2ETesting && isFadingOut ? 0 : undefined
      }}
    >
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
