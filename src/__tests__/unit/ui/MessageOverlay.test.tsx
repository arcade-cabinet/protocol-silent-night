import { render, screen, waitFor } from '@testing-library/react';
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
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();

    render(<MessageOverlay />);

    await waitFor(() => {
      expect(screen.getByText('⚠ WARNING: BOSS DETECTED ⚠')).toBeInTheDocument();
    });
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
