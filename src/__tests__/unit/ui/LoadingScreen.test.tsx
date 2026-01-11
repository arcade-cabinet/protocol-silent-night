import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoadingScreen } from '@/ui/LoadingScreen';

// Mock game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: () => ({
    state: 'MENU'
  })
}));

describe('LoadingScreen Component', () => {
  it('should render loading screen', () => {
    render(<LoadingScreen />);

    // Check for title using heading role
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display initializing message', () => {
    render(<LoadingScreen />);

    expect(screen.getByText(/INITIALIZING SYSTEMS/i)).toBeInTheDocument();
  });

  it('should contain protocol name', () => {
    render(<LoadingScreen />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/PROTOCOL: SILENT NIGHT/i);
  });
});
