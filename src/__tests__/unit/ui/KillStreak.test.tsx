import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { KillStreak } from '@/ui/KillStreak';

describe('KillStreak Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllTimers();
  });

  it('should not render when kill streak is less than 2', () => {
    useGameStore.setState({ killStreak: 1, state: 'PHASE_1' });

    const { container } = render(<KillStreak />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when kill streak is 2 or more', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.setState({ killStreak: 2 });

    render(<KillStreak />);

    await waitFor(() => {
      expect(screen.getByText('DOUBLE KILL')).toBeInTheDocument();
    });
  });

  it('should display correct streak name for triple kill', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.setState({ killStreak: 3 });

    render(<KillStreak />);

    await waitFor(() => {
      expect(screen.getByText('TRIPLE KILL')).toBeInTheDocument();
    });
  });

  it('should display bonus percentage', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.setState({ killStreak: 3 });

    render(<KillStreak />);

    await waitFor(() => {
      expect(screen.getByText(/\+\d+% BONUS/)).toBeInTheDocument();
    });
  });

  it('should show mega kill for 5 streak', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.setState({ killStreak: 5 });

    render(<KillStreak />);

    await waitFor(() => {
      expect(screen.getByText('MEGA KILL')).toBeInTheDocument();
    });
  });
});
