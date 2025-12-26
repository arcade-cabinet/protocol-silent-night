import { describe, expect, it } from 'vitest';
import * as GameExports from '../../../game/index';

describe('Game Index Exports', () => {
  it('should export Terrain component', () => {
    expect(GameExports.Terrain).toBeDefined();
    expect(typeof GameExports.Terrain).toBe('function');
  });

  it('should export Enemies component', () => {
    expect(GameExports.Enemies).toBeDefined();
    expect(typeof GameExports.Enemies).toBe('function');
  });

  it('should export Bullets component', () => {
    expect(GameExports.Bullets).toBeDefined();
    expect(typeof GameExports.Bullets).toBe('function');
  });

  it('should export CameraController component', () => {
    expect(GameExports.CameraController).toBeDefined();
    expect(typeof GameExports.CameraController).toBe('function');
  });

  it('should export Lighting component', () => {
    expect(GameExports.Lighting).toBeDefined();
    expect(typeof GameExports.Lighting).toBe('function');
  });

  it('should export HitParticles component', () => {
    expect(GameExports.HitParticles).toBeDefined();
    expect(typeof GameExports.HitParticles).toBe('function');
  });

  it('should export GameScene component', () => {
    expect(GameExports.GameScene).toBeDefined();
    expect(typeof GameExports.GameScene).toBe('function');
  });

  it('should export all game components', () => {
    const expectedExports = [
      'Terrain',
      'Enemies',
      'Bullets',
      'CameraController',
      'Lighting',
      'HitParticles',
      'GameScene',
    ];

    expectedExports.forEach((exportName) => {
      expect(GameExports).toHaveProperty(exportName);
    });
  });

  it('should have correct number of exports', () => {
    const exportCount = Object.keys(GameExports).length;
    expect(exportCount).toBe(7);
  });
});
