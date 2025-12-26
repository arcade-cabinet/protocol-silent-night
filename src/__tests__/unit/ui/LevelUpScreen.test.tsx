import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LevelUpScreen } from '@/ui/LevelUpScreen';
import { useGameStore } from '@/store/gameStore';
import type { RoguelikeUpgrade } from '@/types';

describe('LevelUpScreen Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render when state is MENU', () => {
    useGameStore.setState({
      state: 'MENU',
      runProgress: {
        xp: 0,
        level: 1,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: [],
      },
    });

    render(<LevelUpScreen />);
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });

  it('should not render when pendingLevelUp is false', () => {
    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 2,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: false,
        upgradeChoices: [],
      },
    });

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

    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 2,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: mockUpgrades,
      },
    });

    render(<LevelUpScreen />);
    expect(screen.getByText('CHOOSE YOUR UPGRADE')).toBeDefined();
    expect(screen.getByText('LEVEL 2')).toBeDefined();
    expect(screen.getByText('Test Upgrade 1')).toBeDefined();
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

    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 3,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: mockUpgrades,
      },
    });

    render(<LevelUpScreen />);
    
    expect(screen.getByText('Damage Boost')).toBeDefined();
    expect(screen.getByText('Shield Wall')).toBeDefined();
    expect(screen.getByText('Increases damage')).toBeDefined();
    expect(screen.getByText('Adds protection')).toBeDefined();
    expect(screen.getByText('COMMON')).toBeDefined();
    expect(screen.getByText('RARE')).toBeDefined();
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

    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 2,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: mockUpgrades,
      },
    });

    render(<LevelUpScreen />);
    
    const upgradeButton = screen.getByText('Coal Fury').closest('button');
    expect(upgradeButton).toBeDefined();
    
    fireEvent.click(upgradeButton!);
    
    const state = useGameStore.getState();
    // After selecting, pendingLevelUp should be false and state should return to PHASE_1
    expect(state.runProgress.pendingLevelUp).toBe(false);
    expect(state.state).toBe('PHASE_1');
    expect(state.runProgress.activeUpgrades['coal_fury']).toBe(1);
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

    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 3,
        selectedUpgrades: ['stackable-upgrade'],
        weaponEvolutions: [],
        activeUpgrades: { 'stackable-upgrade': 2 },
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: mockUpgrades,
      },
    });

    render(<LevelUpScreen />);
    
    // Should show 2/5 (current stacks / max stacks)
    expect(screen.getByText('2/5')).toBeDefined();
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

    useGameStore.setState({
      state: 'LEVEL_UP',
      runProgress: {
        xp: 0,
        level: 4,
        selectedUpgrades: ['test-upgrade-1'],
        weaponEvolutions: [],
        activeUpgrades: { 'test-upgrade-1': 2 },
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: mockUpgrades,
      },
    });

    render(<LevelUpScreen />);
    
    expect(screen.getByText('ACTIVE UPGRADES:')).toBeDefined();
  });

  it('should not render in PHASE_1 state (regression test for bug fix)', () => {
    // This tests the fix: previously the screen would incorrectly show when
    // state was NOT PHASE_1/PHASE_BOSS due to inverted logic
    useGameStore.setState({
      state: 'PHASE_1',
      runProgress: {
        xp: 0,
        level: 2,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: [],
      },
    });

    render(<LevelUpScreen />);
    // Should NOT render because state is PHASE_1, not LEVEL_UP
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });

  it('should not render in PHASE_BOSS state (regression test)', () => {
    useGameStore.setState({
      state: 'PHASE_BOSS',
      runProgress: {
        xp: 0,
        level: 5,
        selectedUpgrades: [],
        weaponEvolutions: [],
        activeUpgrades: {},
        wave: 1,
        timeSurvived: 0,
        pendingLevelUp: true,
        upgradeChoices: [],
      },
    });

    render(<LevelUpScreen />);
    // Should NOT render because state is PHASE_BOSS, not LEVEL_UP
    expect(screen.queryByText('CHOOSE YOUR UPGRADE')).toBeNull();
  });
});
