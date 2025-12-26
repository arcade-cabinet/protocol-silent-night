import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Lighting } from '@/game/Lighting';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('Lighting', () => {
  it('should render correctly', () => {
    expect(() => render(<Lighting />)).not.toThrow();
  });
});
