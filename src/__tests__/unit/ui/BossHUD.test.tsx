import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BossHUD } from '@/ui/BossHUD';
import { useGameStore } from '@/store/gameStore';

describe('BossHUD Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render when boss is not active', () => {
    useGameStore.getState().selectClass('santa');
    
    const { container } = render(<BossHUD />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render when boss is active', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    
    render(<BossHUD />);
    
    expect(screen.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeInTheDocument();
  });

  it('should display boss health correctly', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    
    render(<BossHUD />);
    
    expect(screen.getByText('1000 / 1000')).toBeInTheDocument();
  });

  it('should update health display when boss takes damage', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    const { rerender } = render(<BossHUD />);
    
    useGameStore.getState().damageBoss(300);
    rerender(<BossHUD />);
    
    expect(screen.getByText('700 / 1000')).toBeInTheDocument();
  });

  it('should display correct health bar percentage', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    useGameStore.getState().damageBoss(500);
    
    const { container } = render(<BossHUD />);
    
    const bossBar = container.querySelector('[class*="bossBar"]');
    expect(bossBar).toHaveStyle({ width: '50%' });
  });

  it('should not render in WIN state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    useGameStore.getState().setState('WIN');
    
    const { container } = render(<BossHUD />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render in GAME_OVER state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    useGameStore.getState().setState('GAME_OVER');
    
    const { container } = render(<BossHUD />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should show full health bar at 100%', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    
    const { container } = render(<BossHUD />);
    
    const bossBar = container.querySelector('[class*="bossBar"]');
    expect(bossBar).toHaveStyle({ width: '100%' });
  });

  it('should show near-empty health bar when almost defeated', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    useGameStore.getState().damageBoss(950);
    
    const { container } = render(<BossHUD />);
    
    const bossBar = container.querySelector('[class*="bossBar"]');
    expect(bossBar).toHaveStyle({ width: '5%' });
  });
});
