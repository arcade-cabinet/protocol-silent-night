import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageOverlay } from '@/ui/MessageOverlay';
import { useGameStore, type GameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

const mockedUseGameStore = vi.mocked(useGameStore);

describe('MessageOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boss warning when boss is active', () => {
    mockedUseGameStore.mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    } as Partial<GameStore> as GameStore);

    render(<MessageOverlay />);

    expect(screen.getByText(/WARNING: BOSS DETECTED/)).toBeInTheDocument();
  });

  it('renders mission complete when state is WIN', () => {
    mockedUseGameStore.mockReturnValue({
      state: 'WIN',
      bossActive: false,
    } as Partial<GameStore> as GameStore);

    render(<MessageOverlay />);

    expect(screen.getByText(/MISSION COMPLETE/)).toBeInTheDocument();
  });

  it('renders operator down when state is GAME_OVER', () => {
    mockedUseGameStore.mockReturnValue({
      state: 'GAME_OVER',
      bossActive: false,
    } as Partial<GameStore> as GameStore);

    render(<MessageOverlay />);

    expect(screen.getByText(/OPERATOR DOWN/)).toBeInTheDocument();
  });

  it('is accessible with role="alert"', () => {
    mockedUseGameStore.mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    } as Partial<GameStore> as GameStore);

    render(<MessageOverlay />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/WARNING: BOSS DETECTED/);
  });
});
