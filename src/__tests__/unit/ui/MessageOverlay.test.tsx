import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageOverlay } from '@/ui/MessageOverlay';
import { useGameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('MessageOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boss warning when boss is active', () => {
    vi.mocked(useGameStore).mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    } as ReturnType<typeof useGameStore>);

    render(<MessageOverlay />);

    expect(screen.getByText(/WARNING: BOSS DETECTED/)).toBeInTheDocument();
  });

  it('renders mission complete when state is WIN', () => {
    vi.mocked(useGameStore).mockReturnValue({
      state: 'WIN',
      bossActive: false,
    } as ReturnType<typeof useGameStore>);

    render(<MessageOverlay />);

    expect(screen.getByText(/MISSION COMPLETE/)).toBeInTheDocument();
  });

  it('renders operator down when state is GAME_OVER', () => {
    vi.mocked(useGameStore).mockReturnValue({
      state: 'GAME_OVER',
      bossActive: false,
    } as ReturnType<typeof useGameStore>);

    render(<MessageOverlay />);

    expect(screen.getByText(/OPERATOR DOWN/)).toBeInTheDocument();
  });

  it('is accessible with role="alert"', () => {
    vi.mocked(useGameStore).mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    } as ReturnType<typeof useGameStore>);

    render(<MessageOverlay />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/WARNING: BOSS DETECTED/);
  });
});
