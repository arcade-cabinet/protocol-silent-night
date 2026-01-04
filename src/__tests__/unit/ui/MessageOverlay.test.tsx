import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { MessageOverlay } from '@/ui/MessageOverlay';
import type { GameState } from '@/types';

// Mock the store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

const mockUseGameStore = vi.mocked(useGameStore);

// Helper to create partial mock of GameStore
type PartialGameStore = Partial<ReturnType<typeof useGameStore>>;

const createMockStore = (overrides: PartialGameStore): PartialGameStore => ({
  state: 'MENU' as GameState,
  bossActive: false,
  lastSfxTime: 0,
  ...overrides,
});

describe('MessageOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boss warning when boss is active', () => {
    mockUseGameStore.mockReturnValue(
      createMockStore({
        state: 'PHASE_BOSS',
        bossActive: true,
        lastSfxTime: 0,
      }) as ReturnType<typeof useGameStore>
    );

    render(<MessageOverlay />);

    expect(screen.getByText(/WARNING: HIGH VALUE TARGET DETECTED/)).toBeInTheDocument();
    expect(screen.getByText(/TARGET: MECHA-SANTA/)).toBeInTheDocument();
  });

  it('renders mission complete when state is WIN', () => {
    mockUseGameStore.mockReturnValue(
      createMockStore({
        state: 'WIN',
        bossActive: false,
        lastSfxTime: 0,
      }) as ReturnType<typeof useGameStore>
    );

    render(<MessageOverlay />);

    expect(screen.getByText(/MISSION COMPLETE/)).toBeInTheDocument();
    expect(screen.getByText(/TARGET NEUTRALIZED/)).toBeInTheDocument();
  });

  it('renders operator down when state is GAME_OVER', () => {
    mockUseGameStore.mockReturnValue(
      createMockStore({
        state: 'GAME_OVER',
        bossActive: false,
        lastSfxTime: 0,
      }) as ReturnType<typeof useGameStore>
    );

    render(<MessageOverlay />);

    expect(screen.getByText(/OPERATOR DOWN/)).toBeInTheDocument();
    expect(screen.getByText(/MISSION FAILED/)).toBeInTheDocument();
  });

  it('is accessible with role="alert"', () => {
    mockUseGameStore.mockReturnValue(
      createMockStore({
        state: 'PHASE_BOSS',
        bossActive: true,
        lastSfxTime: 0,
      }) as ReturnType<typeof useGameStore>
    );

    render(<MessageOverlay />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
