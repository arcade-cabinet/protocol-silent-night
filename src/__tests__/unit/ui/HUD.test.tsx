import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HUD } from '@/ui/HUD';
import { useGameStore } from '@/store/gameStore';

describe('HUD Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render in MENU state', () => {
    const { container } = render(<HUD />);
    expect(container.firstChild).toBeNull();
  });

  it('should render in PHASE_1 state', () => {
    useGameStore.getState().selectClass('santa');
    
    render(<HUD />);
    
    expect(screen.getByText('OPERATOR STATUS')).toBeInTheDocument();
    expect(screen.getByText('CURRENT OBJECTIVE')).toBeInTheDocument();
  });

  it('should display player health correctly', () => {
    useGameStore.getState().selectClass('santa');
    
    render(<HUD />);
    
    expect(screen.getByText('300 / 300')).toBeInTheDocument();
  });

  it('should update health display when damaged', () => {
    useGameStore.getState().selectClass('santa');
    const { rerender } = render(<HUD />);
    
    useGameStore.getState().damagePlayer(100);
    rerender(<HUD />);
    
    expect(screen.getByText('200 / 300')).toBeInTheDocument();
  });

  it('should display health bar percentage correctly', () => {
    useGameStore.getState().selectClass('elf');
    useGameStore.getState().damagePlayer(50);
    
    const { container } = render(<HUD />);
    
    const healthBar = container.querySelector('[class*="hpBar"]');
    expect(healthBar).toHaveStyle({ width: '50%' });
  });

  it('should show correct objective in PHASE_1', () => {
    useGameStore.getState().selectClass('santa');
    
    render(<HUD />);
    
    expect(screen.getByText('ELIMINATE 10 MORE')).toBeInTheDocument();
  });

  it('should update kills remaining in objective', () => {
    useGameStore.getState().selectClass('santa');
    const { rerender } = render(<HUD />);
    
    useGameStore.getState().addKill(50);
    useGameStore.getState().addKill(50);
    useGameStore.getState().addKill(50);
    rerender(<HUD />);
    
    expect(screen.getByText('ELIMINATE 7 MORE')).toBeInTheDocument();
  });

  it('should show boss objective in PHASE_BOSS', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('PHASE_BOSS');
    
    render(<HUD />);
    
    expect(screen.getByText('DESTROY KRAMPUS-PRIME')).toBeInTheDocument();
  });

  it('should show mission complete in WIN state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<HUD />);
    
    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
  });

  it('should show system failure in GAME_OVER state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('GAME_OVER');
    
    render(<HUD />);
    
    expect(screen.getByText('SYSTEM FAILURE')).toBeInTheDocument();
  });

  it('should display current score', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().addKill(100);
    
    render(<HUD />);
    
    expect(screen.getByText(/SCORE: 100/)).toBeInTheDocument();
  });

  it('should update score display when kills added', () => {
    useGameStore.getState().selectClass('santa');
    const { rerender } = render(<HUD />);
    
    useGameStore.getState().addKill(50);
    useGameStore.getState().addKill(75);
    rerender(<HUD />);
    
    expect(screen.getByText(/SCORE: 1\d\d/)).toBeInTheDocument();
  });

  it('should work with different character classes', () => {
    useGameStore.getState().selectClass('elf');
    
    render(<HUD />);
    
    expect(screen.getByText('100 / 100')).toBeInTheDocument();
  });
});
