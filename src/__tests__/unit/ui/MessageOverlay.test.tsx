import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { MessageOverlay } from '@/ui/MessageOverlay';

describe('MessageOverlay Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render in MENU state', () => {
    const { container } = render(<MessageOverlay />);

    expect(container.firstChild).toBeNull();
  });

  it('should render warning message when boss spawns', async () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
      // Set level to 10 to avoid level-up interruption
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 10 }
      });
      // Manually trigger boss spawn
      useGameStore.getState().spawnBoss();
    });

    render(<MessageOverlay />);

    await waitFor(() => {
      const warningText = screen.queryByText(/WARNING/i) || screen.queryByText(/DETECTED/i);
      expect(warningText).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should render win message in WIN state', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');

    render(<MessageOverlay />);

    await waitFor(() => {
      expect(screen.getByText('✓ MISSION COMPLETE ✓')).toBeInTheDocument();
    });
  });

  it('should render game over message in GAME_OVER state', async () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('GAME_OVER');

    render(<MessageOverlay />);

    await waitFor(() => {
      expect(screen.getByText('✗ OPERATOR DOWN ✗')).toBeInTheDocument();
    });
  });
});
