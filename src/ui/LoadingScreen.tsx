/**
 * Loading Screen Component
 * Shows while WebGL context and assets are loading
 */

import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 1500 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Detect test environment for faster loading
    const isPlaywrightTest = typeof window !== 'undefined' && (
      (window.navigator as any).webdriver === true ||
      window.navigator.userAgent.includes('Playwright') ||
      window.navigator.userAgent.includes('HeadlessChrome') ||
      (window as any).__playwright !== undefined
    );
    const isTestEnv = import.meta.env.MODE === 'test' || isPlaywrightTest;
    const actualMinDuration = isTestEnv ? 100 : minDuration;
    const progressInterval = isTestEnv ? 10 : 100;

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, progressInterval);

    // Hide after minimum duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, actualMinDuration);

    return () => {
      clearInterval(interval);
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
