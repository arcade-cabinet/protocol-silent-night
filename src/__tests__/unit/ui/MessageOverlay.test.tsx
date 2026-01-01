import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageOverlay } from '@/ui/MessageOverlay';
import { useGameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

const mockUseGameStore = useGameStore as unknown as ReturnType<typeof vi.fn>;

describe('MessageOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boss warning when boss is active', () => {
    mockUseGameStore.mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/WARNING: BOSS DETECTED/)).toBeInTheDocument();
  });

  it('renders mission complete when state is WIN', () => {
    mockUseGameStore.mockReturnValue({
      state: 'WIN',
      bossActive: false,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/MISSION COMPLETE/)).toBeInTheDocument();
  });

  it('renders operator down when state is GAME_OVER', () => {
    mockUseGameStore.mockReturnValue({
      state: 'GAME_OVER',
      bossActive: false,
    });

    render(<MessageOverlay />);

    expect(screen.getByText(/OPERATOR DOWN/)).toBeInTheDocument();
  });

  it('is accessible with role="alert"', () => {
    mockUseGameStore.mockReturnValue({
      state: 'PHASE_BOSS',
      bossActive: true,
    });

    render(<MessageOverlay />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/WARNING: BOSS DETECTED/);
  });
});
