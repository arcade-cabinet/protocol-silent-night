/**
 * Mission Briefing Component
 * Displays mission objectives before starting the game
 */

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AudioManager } from '@/audio/AudioManager';
import styles from './MissionBriefing.module.css';

export function MissionBriefing() {
  const { state, setState, playerClass } = useGameStore();
  const [currentLine, setCurrentLine] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const briefingLines = useMemo(() => [
    { label: 'OPERATION', text: 'SILENT NIGHT', accent: true },
    { label: 'OPERATOR', text: playerClass?.name || 'UNKNOWN' },
    { label: 'ROLE', text: playerClass?.role || 'UNKNOWN' },
    { label: 'PRIMARY OBJECTIVE', text: 'Eliminate hostile Grinch-Bot forces' },
    { label: 'SECONDARY OBJECTIVE', text: 'Neutralize Krampus-Prime command unit' },
    { label: 'INTEL', text: 'Defeat 10 Grinch-Bots to draw out Krampus-Prime' },
    { label: 'WARNING', text: 'Hostiles are aggressive - engage on sight', warning: true },
  ], [playerClass]);

  useEffect(() => {
    if (state !== 'BRIEFING') return;

    // Play briefing sound
    AudioManager.playSFX('ui_click');

    // Reveal lines one by one
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= briefingLines.length - 1) {
          clearInterval(interval);
          setTimeout(() => setShowButton(true), 500);
          return prev;
        }
        AudioManager.playSFX('ui_click');
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
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
          <button
            type="button"
            className={styles.startButton}
            onClick={handleStart}
          >
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
