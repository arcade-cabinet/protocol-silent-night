import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactTestRenderer from '@react-three/test-renderer';
import { HitParticles } from '@/game/HitParticles';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

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
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = await ReactTestRenderer.create(<HitParticles />);
    });
    
    expect(renderer!.scene).toBeDefined();

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
      enemies: [{ type: 'boss', mesh: new THREE.Object3D() }] as any,
    });

    await ReactTestRenderer.act(async () => {
      await renderer!.advanceFrames(1, 0.1);
    });

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
  });
});
