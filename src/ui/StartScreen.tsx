/**
 * Start Screen Component
 * Class selection menu
 */

import { useEffect, useRef } from 'react';
import { AudioManager } from '@/audio/AudioManager';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_CLASSES, type PlayerClassType } from '@/types';
import styles from './StartScreen.module.css';

export function StartScreen() {
  const { state, selectClass, highScore } = useGameStore();
  const audioInitializedRef = useRef(false);

  // Initialize audio when screen is shown (on any interaction)
  useEffect(() => {
    if (state !== 'MENU') return;

    const initAudio = async () => {
      if (!audioInitializedRef.current) {
        await AudioManager.initialize();
        audioInitializedRef.current = true;
        // Play menu music after initialization
        AudioManager.playMusic('menu');
      }
    };

    // Listen for first interaction to init audio
    const handleInteraction = () => {
      initAudio();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [state]);

  if (state !== 'MENU') return null;

  const handleSelectClass = async (type: PlayerClassType) => {
    // Initialize audio on first user interaction (but don't block on it)
    try {
      await AudioManager.initialize();
      audioInitializedRef.current = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
    // Always proceed with class selection, even if audio fails
    selectClass(type);
  };

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>
        Protocol: <span className={styles.accent}>Silent Night</span>
      </h1>
      <h3 className={styles.subtitle}>Operator Edition v3.0</h3>

      <div className={styles.classContainer}>
        {/* Santa Card */}
        <button
          type="button"
          className={styles.classCard}
          onClick={() => handleSelectClass('santa')}
        >
          <div className={styles.cardTitle} style={{ color: '#ff0044' }}>
            {PLAYER_CLASSES.santa.name}
          </div>
          <div className={styles.cardRole}>{PLAYER_CLASSES.santa.role}</div>
          <div className={styles.cardStats}>
            <div className={styles.stat}>
              HP: <span className={styles.statVal}>{PLAYER_CLASSES.santa.hp}</span>
            </div>
            <div className={styles.stat}>
              SPEED: <span className={styles.statVal}>{PLAYER_CLASSES.santa.speed}</span>
            </div>
            <div className={styles.stat}>
              WEAPON: <span className={styles.statVal}>COAL CANNON</span>
            </div>
          </div>
        </button>

        {/* Elf Card */}
        <button type="button" className={styles.classCard} onClick={() => handleSelectClass('elf')}>
          <div className={styles.cardTitle} style={{ color: '#00ffcc' }}>
            {PLAYER_CLASSES.elf.name}
          </div>
          <div className={styles.cardRole}>{PLAYER_CLASSES.elf.role}</div>
          <div className={styles.cardStats}>
            <div className={styles.stat}>
              HP: <span className={styles.statVal}>{PLAYER_CLASSES.elf.hp}</span>
            </div>
            <div className={styles.stat}>
              SPEED: <span className={styles.statVal}>{PLAYER_CLASSES.elf.speed}</span>
            </div>
            <div className={styles.stat}>
              WEAPON: <span className={styles.statVal}>PLASMA SMG</span>
            </div>
          </div>
        </button>

        {/* Bumble Card */}
        <button
          type="button"
          className={styles.classCard}
          onClick={() => handleSelectClass('bumble')}
        >
          <div className={styles.cardTitle} style={{ color: '#eeeeee' }}>
            {PLAYER_CLASSES.bumble.name}
          </div>
          <div className={styles.cardRole}>{PLAYER_CLASSES.bumble.role}</div>
          <div className={styles.cardStats}>
            <div className={styles.stat}>
              HP: <span className={styles.statVal}>{PLAYER_CLASSES.bumble.hp}</span>
            </div>
            <div className={styles.stat}>
              SPEED: <span className={styles.statVal}>{PLAYER_CLASSES.bumble.speed}</span>
            </div>
            <div className={styles.stat}>
              WEAPON: <span className={styles.statVal}>STAR THROWER</span>
            </div>
          </div>
        </button>
      </div>

      <div className={styles.instructions}>
        <p>WASD or Arrow Keys to move • SPACE or Click to fire</p>
        {highScore > 0 && <p className={styles.highScore}>HIGH SCORE: {highScore}</p>}
      </div>
    </div>
  );
}
