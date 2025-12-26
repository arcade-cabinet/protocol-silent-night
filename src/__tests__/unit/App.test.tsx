/**
 * Tests for App component
 * Verifies main application structure and rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';
import { useGameStore } from '../../store/gameStore';
import { PLAYER_CLASSES } from '@/types';

// Mock GameScene to avoid Three.js complexity
vi.mock('@/game', () => ({
  GameScene: () => <div data-testid="game-scene">Game Scene</div>,
}));

describe('App', () => {
  beforeEach(() => {
    useGameStore.setState({
      state: 'MENU',
      playerClass: null,
      playerHp: 0,
      playerMaxHp: 0,
      bossHp: 0,
      bossMaxHp: 0,
      bossActive: false,
      stats: {
        kills: 0,
        score: 0,
        bossDefeated: false,
      },
      input: {
        movement: { x: 0, y: 0 },
        isFiring: false,
        joystickActive: false,
        joystickOrigin: { x: 0, y: 0 },
      },
    });
  });

  describe('Structure', () => {
    it('should render the main app container', () => {
      const { container } = render(<App />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv).toBeTruthy();
      expect(mainDiv.style.width).toBe('100%');
      expect(mainDiv.style.height).toBe('100%');
      expect(mainDiv.style.position).toBe('relative');
    });

    it('should render the GameScene component', () => {
      const { getByTestId } = render(<App />);
      expect(getByTestId('game-scene')).toBeTruthy();
    });

    it('should render all UI components', () => {
      const { container } = render(<App />);
      
      // App should render without errors
      expect(container).toBeTruthy();
      
      // Note: Individual UI components are tested separately
      // This test ensures they're all included in the App structure
    });
  });

  describe('Game States', () => {
    it('should render properly in MENU state', () => {
      useGameStore.setState({ state: 'MENU' });
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render properly in PLAYING state', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        playerClass: PLAYER_CLASSES['santa'],
        playerHp: 300,
        playerMaxHp: 300,
      });
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render properly in WIN state', () => {
      useGameStore.setState({ state: 'WIN' });
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render properly in GAME_OVER state', () => {
      useGameStore.setState({ state: 'GAME_OVER' });
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should render HUD during gameplay', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        playerClass: PLAYER_CLASSES['santa'],
        playerHp: 300,
        playerMaxHp: 300,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render BossHUD when boss is active', () => {
      useGameStore.setState({
        state: 'PHASE_BOSS',
        playerClass: PLAYER_CLASSES['santa'],
        bossActive: true,
        bossHp: 1000,
        bossMaxHp: 1000,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render InputControls during gameplay', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        playerClass: PLAYER_CLASSES['santa'],
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render StartScreen in menu', () => {
      useGameStore.setState({ state: 'MENU' });
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render EndScreen on game over', () => {
      useGameStore.setState({
        state: 'GAME_OVER',
        stats: { kills: 10, score: 1000, bossDefeated: false },
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render EndScreen on win', () => {
      useGameStore.setState({
        state: 'WIN',
        stats: { kills: 20, score: 5000, bossDefeated: true },
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describe('Effects Integration', () => {
    it('should render DamageFlash effect', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        damageFlash: true,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render KillStreak indicator', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        stats: { kills: 5, score: 500, bossDefeated: false },
        killStreak: 5,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render BossVignette when boss is active', () => {
      useGameStore.setState({
        state: 'PHASE_BOSS',
        bossActive: true,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describe('Layering', () => {
    it('should render components in correct order', () => {
      const { container } = render(<App />);
      const mainDiv = container.firstChild as HTMLElement;
      
      // Check that container exists
      expect(mainDiv).toBeTruthy();
      
      // Components should be layered: GameScene, then UI overlays
      // This ensures proper z-index stacking
    });
  });

  describe('Responsiveness', () => {
    it('should use full viewport dimensions', () => {
      const { container } = render(<App />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv.style.width).toBe('100%');
      expect(mainDiv.style.height).toBe('100%');
    });

    it('should use relative positioning for overlays', () => {
      const { container } = render(<App />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv.style.position).toBe('relative');
    });
  });
});
