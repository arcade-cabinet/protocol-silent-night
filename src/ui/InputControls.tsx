/**
 * Input Controls Component
 * Handles keyboard, mouse, and touch input
 */

import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/gameStore';
import styles from './InputControls.module.css';

export function InputControls() {
  const joystickZoneRef = useRef<HTMLDivElement>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);

  const { state, setMovement, setFiring, setJoystick, input } = useGameStore(
    useShallow((state) => ({
      state: state.state,
      setMovement: state.setMovement,
      setFiring: state.setFiring,
      setJoystick: state.setJoystick,
      input: state.input,
    }))
  );

  // Keyboard input
  useEffect(() => {
    const keys = new Set<string>();

    const updateMovement = () => {
      let x = 0;
      let y = 0;

      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;

      // Normalize diagonal movement
      if (x !== 0 && y !== 0) {
        const len = Math.sqrt(x * x + y * y);
        x /= len;
        y /= len;
      }

      setMovement(x, y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Prevent default for game keys
      if (
        ['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
      ) {
        e.preventDefault();
      }

      keys.add(key);
      updateMovement();

      // Fire on space
      if (key === ' ') {
        setFiring(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.delete(key);
      updateMovement();

      if (key === ' ') {
        setFiring(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setMovement, setFiring]);

  // Touch joystick handler
  const handleJoystickStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      setJoystick(true, { x: clientX, y: clientY });

      // Show joystick visuals
      if (joystickBaseRef.current && joystickKnobRef.current) {
        joystickBaseRef.current.style.display = 'block';
        joystickBaseRef.current.style.left = `${clientX}px`;
        joystickBaseRef.current.style.top = `${clientY}px`;

        joystickKnobRef.current.style.display = 'block';
        joystickKnobRef.current.style.left = `${clientX}px`;
        joystickKnobRef.current.style.top = `${clientY}px`;
      }
    },
    [setJoystick]
  );

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!input.joystickActive) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - input.joystickOrigin.x;
      const dy = clientY - input.joystickOrigin.y;

      const maxDist = 50;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
      const angle = Math.atan2(dy, dx);

      const normalizedX = (Math.cos(angle) * dist) / maxDist;
      const normalizedY = (Math.sin(angle) * dist) / maxDist;

      setMovement(normalizedX, normalizedY);

      // Update knob position
      if (joystickKnobRef.current) {
        joystickKnobRef.current.style.left = `${input.joystickOrigin.x + normalizedX * maxDist}px`;
        joystickKnobRef.current.style.top = `${input.joystickOrigin.y + normalizedY * maxDist}px`;
      }
    },
    [input.joystickActive, input.joystickOrigin, setMovement]
  );

  const handleJoystickEnd = useCallback(() => {
    setJoystick(false);
    setMovement(0, 0);

    // Hide joystick visuals
    if (joystickBaseRef.current && joystickKnobRef.current) {
      joystickBaseRef.current.style.display = 'none';
      joystickKnobRef.current.style.display = 'none';
    }
  }, [setJoystick, setMovement]);

  // Fire button handlers
  const handleFireStart = useCallback(() => {
    setFiring(true);
  }, [setFiring]);

  const handleFireEnd = useCallback(() => {
    setFiring(false);
  }, [setFiring]);

  if (state === 'MENU' || state === 'BRIEFING' || state === 'WIN' || state === 'GAME_OVER') {
    return null;
  }

  return (
    <>
      {/* Joystick Zone (left side) */}
      <div
        ref={joystickZoneRef}
        className={styles.joystickZone}
        role="application"
        aria-label="Virtual joystick control area"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onMouseDown={handleJoystickStart}
        onMouseMove={handleJoystickMove}
        onMouseUp={handleJoystickEnd}
        onMouseLeave={handleJoystickEnd}
      />

      {/* Joystick Visuals */}
      <div ref={joystickBaseRef} className={styles.joystickBase} />
      <div ref={joystickKnobRef} className={styles.joystickKnob} />

      {/* Fire Button (right side) */}
      <div className={styles.controlsArea}>
        <button
          className={styles.fireBtn}
          onTouchStart={handleFireStart}
          onTouchEnd={handleFireEnd}
          onMouseDown={handleFireStart}
          onMouseUp={handleFireEnd}
          onMouseLeave={handleFireEnd}
          type="button"
        >
          FIRE
        </button>
      </div>
    </>
  );
}
