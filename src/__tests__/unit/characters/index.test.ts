import { describe, expect, it } from 'vitest';
import * as CharacterExports from '../../../characters/index';

describe('Characters Index Exports', () => {
  it('should export SantaCharacter component', () => {
    expect(CharacterExports.SantaCharacter).toBeDefined();
    expect(typeof CharacterExports.SantaCharacter).toBe('function');
  });

  it('should export ElfCharacter component', () => {
    expect(CharacterExports.ElfCharacter).toBeDefined();
    expect(typeof CharacterExports.ElfCharacter).toBe('function');
  });

  it('should export BumbleCharacter component', () => {
    expect(CharacterExports.BumbleCharacter).toBeDefined();
    expect(typeof CharacterExports.BumbleCharacter).toBe('function');
  });

  it('should export PlayerController component', () => {
    expect(CharacterExports.PlayerController).toBeDefined();
    expect(typeof CharacterExports.PlayerController).toBe('function');
  });

  it('should export all character components', () => {
    const expectedExports = [
      'SantaCharacter',
      'ElfCharacter',
      'BumbleCharacter',
      'PlayerController',
    ];

    expectedExports.forEach((exportName) => {
      expect(CharacterExports).toHaveProperty(exportName);
    });
  });

  it('should have correct number of exports', () => {
    const exportCount = Object.keys(CharacterExports).length;
    expect(exportCount).toBe(4);
  });
});
