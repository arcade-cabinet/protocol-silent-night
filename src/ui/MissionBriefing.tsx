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
  const { state, setState, playerClass, missionBriefing } = useGameStore();
  const [currentLine, setCurrentLine] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const briefingLines = useMemo(() => {
    const lines: BriefingLine[] = [
      { label: 'OPERATION', text: missionBriefing.title, accent: true },
      { label: 'OPERATOR', text: playerClass?.name || 'UNKNOWN' },
      { label: 'ROLE', text: playerClass?.role || 'UNKNOWN' },
    ];

    // Add intel lines from store
    for (const [index, intel] of missionBriefing.intel.entries()) {
      const label =
        index === 0 ? 'PRIMARY OBJECTIVE' : index === 1 ? 'SECONDARY OBJECTIVE' : 'INTEL';
      lines.push({ label, text: intel });
    }

    // Add final warning
    lines.push({
      label: 'WARNING',
      text: 'Hostiles are aggressive - engage on sight',
      warning: true,
    });

    return lines;
  }, [playerClass, missionBriefing]);

  // Check if running in E2E test environment (outside effect to avoid recreating on every render)
  const isE2E = typeof window !== 'undefined' && (window as any).__E2E_TESTING__;

  useEffect(() => {
    if (state !== 'BRIEFING') return;

    // Reset state when briefing starts
    setCurrentLine(0);
    setShowButton(false);

    // In E2E mode, skip animations and show everything immediately
    if (isE2E) {
      // Use setTimeout to ensure state updates are batched and committed
      const timeoutId = setTimeout(() => {
        setCurrentLine(briefingLines.length - 1);
        setShowButton(true);
      }, 0);
      AudioManager.playSFX('ui_click');
      return () => clearTimeout(timeoutId);
    }

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
  }, [state, briefingLines, isE2E]);

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
