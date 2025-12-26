import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Enemies } from '@/game/Enemies';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb) => {
    // We can manually trigger the callback in tests if needed
    return null;
  }),
  useThree: vi.fn(() => ({
    camera: new THREE.PerspectiveCamera(),
    scene: new THREE.Scene(),
    gl: {
      capabilities: { isWebGL2: true },
      setAnimationLoop: vi.fn(),
    },
  })),
}));

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
}));

// Mock InstancedMinions and other subcomponents to avoid R3F rendering issues in unit tests
vi.mock('@/game/Enemies', async () => {
  const actual = await vi.importActual('@/game/Enemies');
  return {
    ...actual,
    InstancedMinions: () => null,
    BossRenderer: () => null,
  };
});

describe('Spawning Logic', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  });

  it('Enemies should spawn when state transitions to PHASE_1', async () => {
    // Start in MENU
    useGameStore.setState({ state: 'MENU' });
    
    // Render Enemies (it shouldn't render anything but its effects should run)
    // Actually, GameScene only renders Enemies when state is not MENU/BRIEFING.
    // So we need to set state to something else, or render it directly.
    
    render(<Enemies />);
    
    // Transition to PHASE_1
    useGameStore.setState({ state: 'PHASE_1' });
    
    // Enemies.tsx has a useEffect that spawns initial minions
    // It uses setTimeout, so we need to wait.
    
    await waitFor(() => {
      const enemies = useGameStore.getState().enemies;
      expect(enemies.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('Obstacles should spawn if noise is above threshold', async () => {
    const strata = await import('@jbcom/strata');
    // Mock noise to be high
    vi.mocked(strata.noise3D).mockReturnValue(0.95);
    
    render(<Terrain />);
    
    const obstacles = useGameStore.getState().obstacles;
    expect(obstacles.length).toBeGreaterThan(0);
  });
});
