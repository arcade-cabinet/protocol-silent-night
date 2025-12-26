import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HitParticles } from '@/game/HitParticles';
import { useGameStore } from '@/store/gameStore';

describe('HitParticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      stats: { score: 0, kills: 0, bossDefeated: false },
      bossHp: 1000,
      playerPosition: new THREE.Vector3(0, 0, 0),
    });
  });

  it('should render and handle useFrame', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<HitParticles />)) as any;
    expect(renderer.scene).toBeDefined();

    // Trigger kill to spawn particles
    useGameStore.setState({
      stats: { score: 10, kills: 1, bossDefeated: false },
    });

    await ReactTestRenderer.act(async () => {
      await renderer!.advanceFrames(1, 0.1);
    });

    // Trigger boss damage to spawn particles
    useGameStore.setState({
      bossHp: 900,
      enemies: [
        {
          id: 'boss',
          type: 'boss',
          mesh: new THREE.Object3D(),
          velocity: new THREE.Vector3(),
          hp: 1000,
          maxHp: 1000,
          isActive: true,
          speed: 3,
          damage: 5,
          pointValue: 1000,
        },
      ],
    });

    await ReactTestRenderer.act(async () => {
      await renderer!.advanceFrames(1, 0.1);
    });

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
  });
});
