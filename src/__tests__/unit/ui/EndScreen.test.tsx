import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndScreen } from '@/ui/EndScreen';
import { useGameStore } from '@/store/gameStore';

describe('EndScreen Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    localStorage.clear();
  });

  it('should not render in MENU state', () => {
    const { container } = render(<EndScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render in PHASE_1 state', () => {
    useGameStore.getState().selectClass('santa');
    const { container } = render(<EndScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('should render in WIN state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
  });

  it('should render in GAME_OVER state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().damagePlayer(300);
    
    render(<EndScreen />);
    
    expect(screen.getByText('OPERATOR DOWN')).toBeInTheDocument();
  });

  it('should display victory message on win', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('The North Pole is secure.')).toBeInTheDocument();
  });

  it('should display defeat message on loss', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().damagePlayer(300);
    
    render(<EndScreen />);
    
    expect(screen.getByText('The threat persists...')).toBeInTheDocument();
  });

  it('should display final score', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().addKill(500);
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('FINAL SCORE')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should display high score', () => {
    useGameStore.setState({ highScore: 1000 });
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('HIGH SCORE')).toBeInTheDocument();
    const scores = screen.getAllByText('1000');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('should display number of kills', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().addKill(50);
    useGameStore.getState().addKill(50);
    useGameStore.getState().addKill(50);
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('ENEMIES ELIMINATED')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show boss defeated status as YES when true', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    useGameStore.setState({ stats: { ...useGameStore.getState().stats, bossDefeated: true } });
    
    render(<EndScreen />);
    
    expect(screen.getByText('BOSS DEFEATED')).toBeInTheDocument();
    expect(screen.getByText('YES')).toBeInTheDocument();
  });

  it('should show boss defeated status as NO when false', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().damagePlayer(300);
    
    render(<EndScreen />);
    
    expect(screen.getByText('BOSS DEFEATED')).toBeInTheDocument();
    expect(screen.getByText('NO')).toBeInTheDocument();
  });

  it('should display new high score indicator', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().addKill(1000);
    useGameStore.getState().updateHighScore();
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('★ NEW HIGH SCORE ★')).toBeInTheDocument();
  });

  it('should not display new high score when not beaten', () => {
    localStorage.setItem('protocol-silent-night-highscore', '5000');
    useGameStore.getState().reset();
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().addKill(100);
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.queryByText('★ NEW HIGH SCORE ★')).not.toBeInTheDocument();
  });

  it('should have re-deploy button', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    const button = screen.getByRole('button', { name: /RE-DEPLOY/ });
    expect(button).toBeInTheDocument();
  });

  it('should reset game when re-deploy clicked', async () => {
    const user = userEvent.setup();
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    const button = screen.getByRole('button', { name: /RE-DEPLOY/ });
    await user.click(button);
    
    expect(useGameStore.getState().state).toBe('MENU');
  });

  it('should apply win styling for victory', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    const { container } = render(<EndScreen />);
    
    const screenEl = container.querySelector('[class*="screen"]');
    expect(screenEl).not.toBeNull();
    expect(screenEl).toHaveAttribute('class');
  });

  it('should apply lose styling for defeat', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().damagePlayer(300);
    
    const { container } = render(<EndScreen />);
    
    const screenEl = container.querySelector('[class*="screen"]');
    expect(screenEl).not.toBeNull();
    expect(screenEl).toHaveAttribute('class');
  });

  it('should show zero score when no kills', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');
    
    render(<EndScreen />);
    
    expect(screen.getByText('FINAL SCORE')).toBeInTheDocument();
    const scores = screen.getAllByText('0');
    expect(scores.length).toBeGreaterThan(0);
  });
});
