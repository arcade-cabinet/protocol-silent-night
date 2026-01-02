import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageOverlay } from '@/ui/MessageOverlay';
import { useGameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

type MockedUseGameStore = ReturnType<typeof vi.fn>;

describe('MessageOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boss warning when boss is active', () => {
    (useGameStore as MockedUseGameStore).mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/WARNING: BOSS DETECTED/)).toBeInTheDocument();
  });

  it('renders mission complete when state is WIN', () => {
    (useGameStore as MockedUseGameStore).mockReturnValue({
      state: 'WIN',
      bossActive: false,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/MISSION COMPLETE/)).toBeInTheDocument();
  });

  it('renders operator down when state is GAME_OVER', () => {
    (useGameStore as MockedUseGameStore).mockReturnValue({
      state: 'GAME_OVER',
      bossActive: false,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/OPERATOR DOWN/)).toBeInTheDocument();
  });

  it('is accessible with role="alert"', () => {
    (useGameStore as MockedUseGameStore).mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    });

    render(<MessageOverlay />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/WARNING: BOSS DETECTED/);
  });
});
