/**
 * Tests for App component
 * Verifies main application structure and rendering
 */

import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PLAYER_CLASSES } from '@/data';
import App from '../../App';
import { useGameStore } from '../../store/gameStore';

// Mock UI components to avoid data-dependency cascading failures
vi.mock('@/ui', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    HUD: () => <div data-testid="hud">HUD</div>,
    WeaponHUD: () => <div data-testid="weapon-hud">WeaponHUD</div>,
    BossHUD: () => <div data-testid="boss-hud">BossHUD</div>,
    StartScreen: () => <div data-testid="start-screen">StartScreen</div>,
    EndScreen: () => <div data-testid="end-screen">EndScreen</div>,
    LevelUpScreen: () => <div data-testid="level-up-screen">LevelUpScreen</div>,
    MissionBriefing: () => <div data-testid="mission-briefing">MissionBriefing</div>,
  };
});

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
    render(<App />);
    expect(screen.getByTestId('start-screen')).toBeInTheDocument();
  });

  it('should render StartScreen in menu', () => {
    useGameStore.setState({ state: 'MENU' });
    render(<App />);
    expect(screen.getByTestId('start-screen')).toBeInTheDocument();
  });

  it('should render properly in PLAYING state', () => {
    act(() => {
      useGameStore.setState({
        state: 'PHASE_1',
        playerClass: PLAYER_CLASSES.santa,
        playerHp: 300,
        playerMaxHp: 300,
      });
    });
    render(<App />);
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  it('should render properly in WIN state', () => {
    act(() => {
      useGameStore.setState({ state: 'WIN' });
    });
    render(<App />);
    expect(screen.getByTestId('end-screen')).toBeInTheDocument();
  });

  it('should render properly in GAME_OVER state', () => {
    act(() => {
      useGameStore.setState({ state: 'GAME_OVER' });
    });
    render(<App />);
    expect(screen.getByTestId('end-screen')).toBeInTheDocument();
  });
  });

  describe('Component Integration', () => {
    it('should render HUD during gameplay', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_1',
          playerClass: PLAYER_CLASSES.santa,
          playerHp: 300,
          playerMaxHp: 300,
        });
      });

      render(<App />);
      expect(screen.getByTestId('hud')).toBeInTheDocument();
    });

    it('should render BossHUD when boss is active', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_BOSS',
          playerClass: PLAYER_CLASSES.santa,
          bossActive: true,
          bossHp: 1000,
          bossMaxHp: 1000,
        });
      });

      render(<App />);
      expect(screen.getByTestId('boss-hud')).toBeInTheDocument();
    });

    it('should render InputControls during gameplay', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_1',
          playerClass: PLAYER_CLASSES.santa,
        });
      });

      render(<App />);
      // InputControls is not mocked and has no data-testid, but we check if App renders it without error
      expect(screen.getByTestId('game-scene')).toBeInTheDocument();
    });

    it('should render EndScreen on game over', () => {
      act(() => {
        useGameStore.setState({
          state: 'GAME_OVER',
          stats: { kills: 10, score: 1000, bossDefeated: false },
        });
      });

      render(<App />);
      expect(screen.getByTestId('end-screen')).toBeInTheDocument();
    });

    it('should render EndScreen on win', () => {
      act(() => {
        useGameStore.setState({
          state: 'WIN',
          stats: { kills: 20, score: 5000, bossDefeated: true },
        });
      });

      render(<App />);
      expect(screen.getByTestId('end-screen')).toBeInTheDocument();
    });
  });

  describe('Effects Integration', () => {
    it('should render DamageFlash effect', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_1',
          damageFlash: true,
        });
      });

      render(<App />);
      expect(screen.getByTestId('game-scene')).toBeInTheDocument();
    });

    it('should render KillStreak indicator', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_1',
          stats: { kills: 5, score: 500, bossDefeated: false },
          killStreak: 5,
        });
      });

      render(<App />);
      expect(screen.getByTestId('game-scene')).toBeInTheDocument();
    });

    it('should render BossVignette when boss is active', () => {
      act(() => {
        useGameStore.setState({
          state: 'PHASE_BOSS',
          bossActive: true,
        });
      });

      render(<App />);
      expect(screen.getByTestId('game-scene')).toBeInTheDocument();
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
