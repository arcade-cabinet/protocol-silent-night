import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { BossVignette } from '@/ui/BossVignette';

describe('BossVignette Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render when boss is not active', () => {
    useGameStore.getState().selectClass('santa');

    const { container } = render(<BossVignette />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when boss is active', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();

    const { container } = render(<BossVignette />);

    expect(container.firstChild).not.toBeNull();
  });

  it('should apply vignette styling', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();

    const { container } = render(<BossVignette />);

    const vignette = container.firstChild;
    expect(vignette).not.toBeNull();
    expect(vignette).toHaveAttribute('class');
  });

  it('should not render in WIN state even if boss was active', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().spawnBoss();
    useGameStore.getState().setState('WIN');

    const { container } = render(<BossVignette />);

    expect(container.firstChild).toBeNull();
  });
});
