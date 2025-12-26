import { describe, it, expect } from 'vitest';
import { GameScene } from '@/game/GameScene';

describe('GameScene', () => {
  it('should be defined', () => {
    expect(GameScene).toBeDefined();
    expect(typeof GameScene).toBe('function');
  });
});
