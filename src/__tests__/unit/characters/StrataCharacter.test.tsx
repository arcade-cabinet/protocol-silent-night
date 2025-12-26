import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StrataCharacter } from '@/characters/StrataCharacter';
import CLASSES_DATA from '@/data/classes.json';
import type { PlayerClassConfig } from '@/types';

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  createCharacter: vi.fn(() => ({
    root: { add: vi.fn(), remove: vi.fn(), traverse: vi.fn() },
    joints: {
      head: { mesh: { add: vi.fn() } },
      torso: { mesh: { add: vi.fn() } },
      armL: { mesh: { add: vi.fn() } },
      armR: { mesh: { add: vi.fn() } },
      legL: { mesh: { add: vi.fn() } },
      legR: { mesh: { add: vi.fn() } },
      hips: { mesh: { add: vi.fn() } },
    },
    state: { speed: 0, maxSpeed: 1 },
  })),
  animateCharacter: vi.fn(),
  updateFurUniforms: vi.fn(),
}));

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('StrataCharacter Component', () => {
  const santaConfig = CLASSES_DATA.santa as PlayerClassConfig;

  it('should render without crashing', () => {
    // We can't easily test the actual 3D output here without more complex setup,
    // but we can check if it initializes with the config.
    const { container } = render(
      <StrataCharacter config={santaConfig} position={[0, 0, 0]} rotation={0} />
    );
    expect(container).toBeDefined();
  });
});
