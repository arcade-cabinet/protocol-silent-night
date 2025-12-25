import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DamageFlash } from '@/ui/DamageFlash';
import { useGameStore } from '@/store/gameStore';

describe('DamageFlash Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render when damageFlash is false', () => {
    const { container } = render(<DamageFlash />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render when damageFlash is true', () => {
    useGameStore.setState({ damageFlash: true });
    
    const { container } = render(<DamageFlash />);
    
    expect(container.firstChild).not.toBeNull();
  });

  it('should apply flash styling', () => {
    useGameStore.setState({ damageFlash: true });
    
    const { container } = render(<DamageFlash />);
    
    const flashElement = container.firstChild;
    expect(flashElement).not.toBeNull();
    expect(flashElement).toHaveAttribute('class');
  });
});
