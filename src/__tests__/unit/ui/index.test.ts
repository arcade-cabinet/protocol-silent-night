import { describe, it, expect } from 'vitest';
import * as UIExports from '../../../ui/index';

describe('UI Index Exports', () => {
  it('should export HUD component', () => {
    expect(UIExports.HUD).toBeDefined();
    expect(typeof UIExports.HUD).toBe('function');
  });

  it('should export StartScreen component', () => {
    expect(UIExports.StartScreen).toBeDefined();
    expect(typeof UIExports.StartScreen).toBe('function');
  });

  it('should export EndScreen component', () => {
    expect(UIExports.EndScreen).toBeDefined();
    expect(typeof UIExports.EndScreen).toBe('function');
  });

  it('should export LoadingScreen component', () => {
    expect(UIExports.LoadingScreen).toBeDefined();
    expect(typeof UIExports.LoadingScreen).toBe('function');
  });

  it('should export BossHUD component', () => {
    expect(UIExports.BossHUD).toBeDefined();
    expect(typeof UIExports.BossHUD).toBe('function');
  });

  it('should export InputControls component', () => {
    expect(UIExports.InputControls).toBeDefined();
    expect(typeof UIExports.InputControls).toBe('function');
  });

  it('should export KillStreak component', () => {
    expect(UIExports.KillStreak).toBeDefined();
    expect(typeof UIExports.KillStreak).toBe('function');
  });

  it('should export MessageOverlay component', () => {
    expect(UIExports.MessageOverlay).toBeDefined();
    expect(typeof UIExports.MessageOverlay).toBe('function');
  });

  it('should export DamageFlash component', () => {
    expect(UIExports.DamageFlash).toBeDefined();
    expect(typeof UIExports.DamageFlash).toBe('function');
  });

  it('should export BossVignette component', () => {
    expect(UIExports.BossVignette).toBeDefined();
    expect(typeof UIExports.BossVignette).toBe('function');
  });

  it('should export all expected UI components', () => {
    const expectedExports = [
      'HUD',
      'StartScreen',
      'EndScreen',
      'LoadingScreen',
      'BossHUD',
      'InputControls',
      'KillStreak',
      'MessageOverlay',
      'DamageFlash',
      'BossVignette',
    ];

    expectedExports.forEach((exportName) => {
      expect(UIExports).toHaveProperty(exportName);
    });
  });

  it('should have correct number of exports', () => {
    const exportCount = Object.keys(UIExports).length;
    expect(exportCount).toBeGreaterThanOrEqual(10);
  });
});
