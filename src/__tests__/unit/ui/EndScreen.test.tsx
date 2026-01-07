import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { EndScreen } from '@/ui/EndScreen';

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

  it('should render properly in WIN state', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/MISSION/i)).toBeInTheDocument();
  });

  it('should render properly in GAME_OVER state', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().damagePlayer(300);
    });

    render(<EndScreen />);

    expect(screen.getByText(/DOWN/i)).toBeInTheDocument();
  });

  it('should display victory message on win', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/MISSION/i)).toBeInTheDocument();
    expect(screen.getByText(/secure/i)).toBeInTheDocument();
  });

  it('should display defeat message on loss', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().damagePlayer(300);
    });

    render(<EndScreen />);

    expect(screen.getByText(/DOWN/i)).toBeInTheDocument();
    expect(screen.getByText(/persists/i)).toBeInTheDocument();
  });

  it('should display final score', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().addKill(500);
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/FINAL SCORE/i)).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should display high score', () => {
    act(() => {
      useGameStore.setState({ highScore: 1000 });
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/HIGH SCORE/i)).toBeInTheDocument();
    const scores = screen.getAllByText('1000');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('should display number of kills', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().addKill(50);
      useGameStore.getState().addKill(50);
      useGameStore.getState().addKill(50);
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/ENEMIES/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show boss defeated status as YES when true', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
      useGameStore.setState({ stats: { ...useGameStore.getState().stats, bossDefeated: true } });
    });

    render(<EndScreen />);

    // Check for "YES" which indicates boss defeated
    expect(screen.getByText('YES')).toBeInTheDocument();
  });

  it('should show boss defeated status as NO when false', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().damagePlayer(300);
    });

    render(<EndScreen />);

    // Check for "NO" which indicates boss not defeated
    expect(screen.getByText('NO')).toBeInTheDocument();
  });

  it('should display new high score indicator', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().addKill(1000);
      useGameStore.getState().updateHighScore();
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.getByText(/NEW HIGH SCORE/i)).toBeInTheDocument();
  });

  it('should not display new high score when not beaten', () => {
    act(() => {
      localStorage.setItem('protocol-silent-night-highscore', '5000');
      useGameStore.getState().reset();
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().addKill(100);
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    expect(screen.queryByText(/NEW HIGH SCORE/i)).not.toBeInTheDocument();
  });

  it('should have re-deploy button on win', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    const button = screen.getByRole('button', { name: /RE-DEPLOY/ });
    expect(button).toBeInTheDocument();
  });

  it('should have re-deploy button on loss', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().damagePlayer(300);
    });

    render(<EndScreen />);

    const button = screen.getByRole('button', { name: /RE-DEPLOY/ });
    expect(button).toBeInTheDocument();
  });

  it('should reset game when re-deploy clicked', async () => {
    const user = userEvent.setup();
    act(() => {
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('WIN');
    });

    render(<EndScreen />);

    const button = screen.getByRole('button', { name: /RE-DEPLOY/ });
    await act(async () => {
      await user.click(button);
    });

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
