import { describe, expect, it } from 'vitest';
import * as CharacterExports from '../../../characters/index';

describe('Characters Index Exports', () => {
  it('should export StrataCharacter component', () => {
    expect(CharacterExports.StrataCharacter).toBeDefined();
    expect(typeof CharacterExports.StrataCharacter).toBe('function');
  });

  it('should export PlayerController component', () => {
    expect(CharacterExports.PlayerController).toBeDefined();
    expect(typeof CharacterExports.PlayerController).toBe('function');
  });

  it('should have correct number of exports', () => {
    const exportCount = Object.keys(CharacterExports).length;
    expect(exportCount).toBe(2);
  });
});
