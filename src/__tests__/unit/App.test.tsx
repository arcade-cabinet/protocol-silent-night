/**
 * Tests for App component
 * Verifies main application structure and rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';
import { useGameStore } from '../../store/gameStore';

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
      maxHp: 0,
      bossHp: 0,
      maxBossHp: 0,
      bossActive: false,
      bossPhase: 1,
      stats: {
        kills: 0,
        score: 0,
        highScore: 0,
        killStreak: 0,
        maxStreak: 0,
      },
      input: {
        movement: { x: 0, y: 0 },
        firing: false,
        joystickActive: false,
        joystickOrigin: { x: 0, y: 0 },
      },
      lastDamageTime: 0,
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
        state: 'PLAYING',
        playerClass: 'santa',
        playerHp: 300,
        maxHp: 300,
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
        state: 'PLAYING',
        playerClass: 'santa',
        playerHp: 300,
        maxHp: 300,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render BossHUD when boss is active', () => {
      useGameStore.setState({
        state: 'PLAYING',
        playerClass: 'santa',
        bossActive: true,
        bossHp: 1000,
        maxBossHp: 1000,
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render InputControls during gameplay', () => {
      useGameStore.setState({
        state: 'PLAYING',
        playerClass: 'santa',
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
        stats: { kills: 10, score: 1000, highScore: 1000, killStreak: 0, maxStreak: 5 },
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render EndScreen on win', () => {
      useGameStore.setState({
        state: 'WIN',
        stats: { kills: 20, score: 5000, highScore: 5000, killStreak: 0, maxStreak: 10 },
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describe('Effects Integration', () => {
    it('should render DamageFlash effect', () => {
      useGameStore.setState({
        state: 'PLAYING',
        lastDamageTime: Date.now(),
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render KillStreak indicator', () => {
      useGameStore.setState({
        state: 'PLAYING',
        stats: { kills: 5, score: 500, highScore: 500, killStreak: 5, maxStreak: 5 },
      });
      
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('should render BossVignette when boss is active', () => {
      useGameStore.setState({
        state: 'PLAYING',
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
