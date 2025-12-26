/**
 * Mission Briefing Component
 * Displays mission objectives before starting the game
 */

import { useEffect, useMemo, useState } from 'react';
import { AudioManager } from '@/audio/AudioManager';
import { useGameStore } from '@/store/gameStore';
import styles from './MissionBriefing.module.css';

interface BriefingLine {
  label: string;
  text: string;
  accent?: boolean;
  warning?: boolean;
}

export function MissionBriefing() {
  const { state, setState, getBriefingLines } = useGameStore();
  const [currentLine, setCurrentLine] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const briefingLines = useMemo(() => getBriefingLines(), [getBriefingLines]);

  useEffect(() => {
    if (state !== 'BRIEFING') return;

    // Play briefing sound
    AudioManager.playSFX('ui_click');

    // Reveal lines one by one
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= briefingLines.length - 1) {
          clearInterval(interval);
          timeoutId = setTimeout(() => setShowButton(true), 500);
          return prev;
        }
        AudioManager.playSFX('ui_click');
        return prev + 1;
      });
    }, 600);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [state, briefingLines]);

  // Reset state when briefing starts
  useEffect(() => {
    if (state === 'BRIEFING') {
      setCurrentLine(0);
      setShowButton(false);
    }
  }, [state]);

  if (state !== 'BRIEFING') return null;

  const handleStart = () => {
    AudioManager.playSFX('ui_select');
    // Start background music
    AudioManager.playMusic('combat');
    setState('PHASE_1');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLine} />
          <span className={styles.headerText}>MISSION BRIEFING</span>
          <div className={styles.headerLine} />
        </div>

        <div className={styles.briefingBox}>
          {briefingLines.slice(0, currentLine + 1).map((line, index) => (
            <div
              key={line.label}
              className={`${styles.briefingLine} ${line.accent ? styles.accent : ''} ${line.warning ? styles.warning : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={styles.label}>{line.label}:</span>
              <span className={styles.value}>{line.text}</span>
            </div>
          ))}
        </div>

        {showButton && (
          <button type="button" className={styles.startButton} onClick={handleStart}>
            <span className={styles.buttonText}>COMMENCE OPERATION</span>
            <div className={styles.buttonGlow} />
          </button>
        )}

        <div className={styles.footer}>
          <span className={styles.classification}>CLASSIFICATION: TOP SECRET</span>
          <span className={styles.divider}>|</span>
          <span className={styles.clearance}>CLEARANCE: DELTA</span>
        </div>
      </div>
    </div>
  );
}
