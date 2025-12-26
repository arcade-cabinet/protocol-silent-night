/**
 * Comprehensive tests for InputControls component
 * Tests keyboard, mouse, and touch input handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputControls } from '../../../ui/InputControls';
import { useGameStore } from '../../../store/gameStore';

describe('InputControls', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      state: 'PLAYING',
      input: {
        movement: { x: 0, y: 0 },
        firing: false,
        joystickActive: false,
        joystickOrigin: { x: 0, y: 0 },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input controls when game is playing', () => {
      useGameStore.setState({ state: 'PLAYING' });
      const { container } = render(<InputControls />);
      
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      expect(joystickZone).toBeTruthy();
      
      const fireButton = screen.getByRole('button', { name: /fire/i });
      expect(fireButton).toBeTruthy();
    });

    it('should not render when state is MENU', () => {
      useGameStore.setState({ state: 'MENU' });
      const { container } = render(<InputControls />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render when state is WIN', () => {
      useGameStore.setState({ state: 'WIN' });
      const { container } = render(<InputControls />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render when state is GAME_OVER', () => {
      useGameStore.setState({ state: 'GAME_OVER' });
      const { container } = render(<InputControls />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Keyboard Input', () => {
    it('should handle W key for upward movement', () => {
      render(<InputControls />);
      
      const keyDownEvent = new KeyboardEvent('keydown', { key: 'w' });
      window.dispatchEvent(keyDownEvent);
      
      const state = useGameStore.getState();
      expect(state.input.movement.y).toBe(-1);
      expect(state.input.movement.x).toBe(0);
    });

    it('should handle S key for downward movement', () => {
      render(<InputControls />);
      
      const keyDownEvent = new KeyboardEvent('keydown', { key: 's' });
      window.dispatchEvent(keyDownEvent);
      
      const state = useGameStore.getState();
      expect(state.input.movement.y).toBe(1);
    });

    it('should handle A key for left movement', () => {
      render(<InputControls />);
      
      const keyDownEvent = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(keyDownEvent);
      
      const state = useGameStore.getState();
      expect(state.input.movement.x).toBe(-1);
    });

    it('should handle D key for right movement', () => {
      render(<InputControls />);
      
      const keyDownEvent = new KeyboardEvent('keydown', { key: 'd' });
      window.dispatchEvent(keyDownEvent);
      
      const state = useGameStore.getState();
      expect(state.input.movement.x).toBe(1);
    });

    it('should handle arrow keys for movement', () => {
      render(<InputControls />);
      
      // Arrow up
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      let state = useGameStore.getState();
      expect(state.input.movement.y).toBe(-1);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
      
      // Arrow down
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      state = useGameStore.getState();
      expect(state.input.movement.y).toBe(1);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
      
      // Arrow left
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      state = useGameStore.getState();
      expect(state.input.movement.x).toBe(-1);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
      
      // Arrow right
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      state = useGameStore.getState();
      expect(state.input.movement.x).toBe(1);
    });

    it('should normalize diagonal movement', () => {
      render(<InputControls />);
      
      // Press W and D simultaneously for diagonal movement
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      
      const state = useGameStore.getState();
      const { x, y } = state.input.movement;
      
      // Check that diagonal movement is normalized (length should be ~1)
      const length = Math.sqrt(x * x + y * y);
      expect(length).toBeCloseTo(1, 5);
      expect(x).toBeCloseTo(Math.SQRT1_2, 5);
      expect(y).toBeCloseTo(-Math.SQRT1_2, 5);
    });

    it('should handle space key to start firing', () => {
      useGameStore.setState({ state: 'PLAYING' });
      render(<InputControls />);
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(true);
    });

    it('should handle space key release to stop firing', () => {
      render(<InputControls />);
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(false);
    });

    it('should reset movement when keys are released', () => {
      render(<InputControls />);
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      
      // Release both keys
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
      
      const state = useGameStore.getState();
      expect(state.input.movement.x).toBe(0);
      expect(state.input.movement.y).toBe(0);
    });

    it('should be case-insensitive for keyboard input', () => {
      render(<InputControls />);
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
      
      const state = useGameStore.getState();
      expect(state.input.movement.y).toBe(-1);
    });

    it('should prevent default for game keys', () => {
      render(<InputControls />);
      
      const preventDefault = vi.fn();
      const event = new KeyboardEvent('keydown', { key: 'w' });
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      window.dispatchEvent(event);
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Fire Button', () => {
    it('should start firing on mouse down', () => {
      useGameStore.setState({ state: 'PLAYING' });
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      fireEvent.mouseDown(fireButton);
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(true);
    });

    it('should stop firing on mouse up', () => {
      useGameStore.setState({ state: 'PLAYING' });
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      fireEvent.mouseDown(fireButton);
      fireEvent.mouseUp(fireButton);
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(false);
    });

    it('should stop firing on mouse leave', () => {
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      fireEvent.mouseDown(fireButton);
      fireEvent.mouseLeave(fireButton);
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(false);
    });

    it('should start firing on touch start', () => {
      useGameStore.setState({ state: 'PLAYING' });
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      fireEvent.touchStart(fireButton, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(true);
    });

    it('should stop firing on touch end', () => {
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      fireEvent.touchStart(fireButton, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchEnd(fireButton);
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(false);
    });
  });

  describe('Virtual Joystick', () => {
    it('should activate joystick on touch start', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        fireEvent.touchStart(joystickZone, {
          touches: [{ clientX: 100, clientY: 200 }],
        });
      }
      
      const state = useGameStore.getState();
      expect(state.input.joystickActive).toBe(true);
      expect(state.input.joystickOrigin).toEqual({ x: 100, y: 200 });
    });

    it('should activate joystick on mouse down', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        fireEvent.mouseDown(joystickZone, {
          clientX: 150,
          clientY: 250,
        });
      }
      
      const state = useGameStore.getState();
      expect(state.input.joystickActive).toBe(true);
      expect(state.input.joystickOrigin).toEqual({ x: 150, y: 250 });
    });

    it('should update movement on joystick drag', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start joystick
        fireEvent.touchStart(joystickZone, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Move joystick
        fireEvent.touchMove(joystickZone, {
          touches: [{ clientX: 150, clientY: 100 }],
        });
      }
      
      const state = useGameStore.getState();
      expect(state.input.movement.x).toBeGreaterThan(0);
    });

    it('should deactivate joystick on touch end', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start joystick
        fireEvent.touchStart(joystickZone, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // End joystick
        fireEvent.touchEnd(joystickZone);
      }
      
      const state = useGameStore.getState();
      expect(state.input.joystickActive).toBe(false);
      expect(state.input.movement).toEqual({ x: 0, y: 0 });
    });

    it('should deactivate joystick on mouse up', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start joystick
        fireEvent.mouseDown(joystickZone, {
          clientX: 100,
          clientY: 100,
        });
        
        // End joystick
        fireEvent.mouseUp(joystickZone);
      }
      
      const state = useGameStore.getState();
      expect(state.input.joystickActive).toBe(false);
    });

    it('should deactivate joystick on mouse leave', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start joystick
        fireEvent.mouseDown(joystickZone, {
          clientX: 100,
          clientY: 100,
        });
        
        // Leave zone
        fireEvent.mouseLeave(joystickZone);
      }
      
      const state = useGameStore.getState();
      expect(state.input.joystickActive).toBe(false);
    });

    it('should clamp joystick distance to max radius', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start joystick
        fireEvent.touchStart(joystickZone, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Move very far from origin (should be clamped)
        fireEvent.touchMove(joystickZone, {
          touches: [{ clientX: 300, clientY: 100 }],
        });
      }
      
      const state = useGameStore.getState();
      // Movement should be normalized to maximum 1
      expect(Math.abs(state.input.movement.x)).toBeLessThanOrEqual(1);
    });

    it('should not update movement when joystick is inactive', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Try to move without starting joystick
        fireEvent.touchMove(joystickZone, {
          touches: [{ clientX: 150, clientY: 150 }],
        });
      }
      
      const state = useGameStore.getState();
      expect(state.input.movement).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<InputControls />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle simultaneous keyboard and touch input', () => {
      useGameStore.setState({ state: 'PLAYING' });
      const { container } = render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      // Keyboard movement
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      
      // Touch fire
      fireEvent.touchStart(fireButton, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      const state = useGameStore.getState();
      expect(state.input.movement.y).toBe(-1);
      expect(state.input.firing).toBe(true);
    });

    it('should handle rapid fire button tapping', () => {
      render(<InputControls />);
      const fireButton = screen.getByRole('button', { name: /fire/i });
      
      // Rapid fire
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseDown(fireButton);
        fireEvent.mouseUp(fireButton);
      }
      
      const state = useGameStore.getState();
      expect(state.input.firing).toBe(false); // Should end up not firing
    });

    it('should handle joystick circular motion', () => {
      const { container } = render(<InputControls />);
      const joystickZone = container.querySelector('[aria-label="Virtual joystick control area"]');
      
      if (joystickZone) {
        // Start at center
        fireEvent.touchStart(joystickZone, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
        
        // Move in a circle pattern
        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI];
        angles.forEach((angle) => {
          const x = 100 + 30 * Math.cos(angle);
          const y = 100 + 30 * Math.sin(angle);
          
          fireEvent.touchMove(joystickZone, {
            touches: [{ clientX: x, clientY: y }],
          });
        });
      }
      
      const state = useGameStore.getState();
      // Should have valid movement after circular motion
      const length = Math.sqrt(
        state.input.movement.x ** 2 + state.input.movement.y ** 2
      );
      expect(length).toBeGreaterThan(0);
      expect(length).toBeLessThanOrEqual(1);
    });
  });
});
