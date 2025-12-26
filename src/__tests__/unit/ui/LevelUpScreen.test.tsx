import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import type { GameState, RoguelikeUpgrade, RunProgressData } from '@/types';
import { LevelUpScreen } from '@/ui/LevelUpScreen';

describe('LevelUpScreen Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  const setupTestState = (
    state: GameState,
    runProgressOverrides: Partial<RunProgressData> = {},
    previousState: GameState = 'PHASE_1'
  ) => {
    const defaultRunProgress: RunProgressData = {
      xp: 0,
      level: 1,
      selectedUpgrades: [],
      weaponEvolutions: [],
      activeUpgrades: {},
      wave: 1,
      timeSurvived: 0,
      pendingLevelUp: false,
      upgradeChoices: [],
    };

    useGameStore.setState({
      state,
      previousState,
      runProgress: { ...defaultRunProgress, ...runProgressOverrides },
    });
  };

  it('should not render when state is MENU', () => {
    setupTestState('MENU', { pendingLevelUp: true });
    render(<LevelUpScreen />);
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });

  it('should not render when pendingLevelUp is false', () => {
    setupTestState('LEVEL_UP', { level: 2, pendingLevelUp: false });
    render(<LevelUpScreen />);
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });

  it('should render when state is LEVEL_UP and pendingLevelUp is true', () => {
    const mockUpgrades: RoguelikeUpgrade[] = [
      {
        id: 'test-upgrade-1',
        name: 'Test Upgrade 1',
        description: 'A test upgrade',
        icon: '⚔️',
        rarity: 'common',
        category: 'offensive',
        maxStacks: 3,
      },
    ];

    setupTestState('LEVEL_UP', {
      level: 2,
      pendingLevelUp: true,
      upgradeChoices: mockUpgrades,
    });

    render(<LevelUpScreen />);
    expect(screen.getByText('CHOOSE YOUR UPGRADE')).not.toBeNull();
    expect(screen.getByText('LEVEL 2')).not.toBeNull();
    expect(screen.getByText('Test Upgrade 1')).not.toBeNull();
  });

  it('should display upgrade choices correctly', () => {
    const mockUpgrades: RoguelikeUpgrade[] = [
      {
        id: 'test-1',
        name: 'Damage Boost',
        description: 'Increases damage',
        icon: '⚔️',
        rarity: 'common',
        category: 'offensive',
        maxStacks: 3,
      },
      {
        id: 'test-2',
        name: 'Shield Wall',
        description: 'Adds protection',
        icon: '🛡️',
        rarity: 'rare',
        category: 'defensive',
        maxStacks: 2,
      },
    ];

    setupTestState('LEVEL_UP', {
      level: 3,
      pendingLevelUp: true,
      upgradeChoices: mockUpgrades,
    });

    render(<LevelUpScreen />);

    expect(screen.getByText('Damage Boost')).not.toBeNull();
    expect(screen.getByText('Shield Wall')).not.toBeNull();
    expect(screen.getByText('Increases damage')).not.toBeNull();
    expect(screen.getByText('Adds protection')).not.toBeNull();
    expect(screen.getByText('COMMON')).not.toBeNull();
    expect(screen.getByText('RARE')).not.toBeNull();
  });

  it('should call selectLevelUpgrade when upgrade is clicked', () => {
    // Use a real upgrade ID from the data
    const mockUpgrades: RoguelikeUpgrade[] = [
      {
        id: 'coal_fury',
        name: 'Coal Fury',
        description: '+15% damage',
        icon: '🔥',
        rarity: 'common',
        category: 'offensive',
        maxStacks: 5,
        stats: { damage: { value: 0.15, type: 'percent' } },
      },
    ];

    setupTestState('LEVEL_UP', {
      level: 2,
      pendingLevelUp: true,
      upgradeChoices: mockUpgrades,
    });

    render(<LevelUpScreen />);

    const upgradeButton = screen.getByText('Coal Fury').closest('button');
    expect(upgradeButton).not.toBeNull();

    fireEvent.click(upgradeButton as HTMLElement);

    const state = useGameStore.getState();
    // After selecting, pendingLevelUp should be false and state should return to PHASE_1
    expect(state.runProgress.pendingLevelUp).toBe(false);
    expect(state.state).toBe('PHASE_1');
    expect(state.runProgress.activeUpgrades.coal_fury).toBe(1);
  });

  it('should show current stack count for upgrades with max stacks > 1', () => {
    const mockUpgrades: RoguelikeUpgrade[] = [
      {
        id: 'stackable-upgrade',
        name: 'Stackable',
        description: 'Can stack',
        icon: '📦',
        rarity: 'common',
        category: 'offensive',
        maxStacks: 5,
      },
    ];

    setupTestState('LEVEL_UP', {
      level: 3,
      selectedUpgrades: ['stackable-upgrade'],
      activeUpgrades: { 'stackable-upgrade': 2 },
      pendingLevelUp: true,
      upgradeChoices: mockUpgrades,
    });

    render(<LevelUpScreen />);

    // Should show 2/5 (current stacks / max stacks)
    expect(screen.getByText('2/5')).not.toBeNull();
  });

  it('should display active upgrades section', () => {
    const mockUpgrades: RoguelikeUpgrade[] = [
      {
        id: 'new-upgrade',
        name: 'New Upgrade',
        description: 'A new upgrade',
        icon: '🆕',
        rarity: 'common',
        category: 'utility',
        maxStacks: 1,
      },
    ];

    setupTestState('LEVEL_UP', {
      level: 4,
      selectedUpgrades: ['test-upgrade-1'],
      activeUpgrades: { 'test-upgrade-1': 2 },
      pendingLevelUp: true,
      upgradeChoices: mockUpgrades,
    });

    render(<LevelUpScreen />);

    expect(screen.getByText('ACTIVE UPGRADES:')).not.toBeNull();
  });

  it('should not render in PHASE_1 state (regression test for bug fix)', () => {
    setupTestState('PHASE_1', { level: 2, pendingLevelUp: true });
    render(<LevelUpScreen />);
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });

  it('should not render in PHASE_BOSS state (regression test)', () => {
    setupTestState('PHASE_BOSS', { level: 5, pendingLevelUp: true });
    render(<LevelUpScreen />);
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });
});
