/**
 * Message Overlay Component
 * Displays important messages (boss spawn, etc.)
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import styles from './MessageOverlay.module.css';

export function MessageOverlay() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const { state, bossActive } = useGameStore();

  // Show boss warning
  useEffect(() => {
    if (bossActive && state === 'PHASE_BOSS') {
      setMessage('⚠ WARNING: BOSS DETECTED ⚠');
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [bossActive, state]);

  // Show win/lose messages
  useEffect(() => {
    if (state === 'WIN') {
      setMessage('✓ MISSION COMPLETE ✓');
      setVisible(true);
    } else if (state === 'GAME_OVER') {
      setMessage('✗ OPERATOR DOWN ✗');
      setVisible(true);
    }
  }, [state]);

  if (!message || !visible) return null;

  return <div className={`${styles.overlay} ${state === 'WIN' ? styles.win : ''}`}>{message}</div>;
}
