import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingScreen } from '@/ui/LoadingScreen';

describe('LoadingScreen Component', () => {
  it('should render loading screen', () => {
    render(<LoadingScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display initializing message', () => {
    render(<LoadingScreen />);

    expect(screen.getByText('INITIALIZING SYSTEMS')).toBeInTheDocument();
  });

  it('should display loading WebGL message', () => {
    render(<LoadingScreen />);

    expect(screen.getByText('Loading WebGL context...')).toBeInTheDocument();
  });

  it('should contain protocol name', () => {
    render(<LoadingScreen />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/PROTOCOL/);
    expect(heading).toHaveTextContent(/SILENT NIGHT/);
  });
});
