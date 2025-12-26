import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { checkCollision } from '@/characters/PlayerController';
import type { ChristmasObstacle } from '@/types';

describe('PlayerController Helpers', () => {
  describe('checkCollision', () => {
    const obstacles: ChristmasObstacle[] = [
      {
        position: new THREE.Vector3(5, 0, 5),
        radius: 1,
        type: 'tree',
        height: 4,
        color: new THREE.Color(0x00ff00),
      },
      {
        position: new THREE.Vector3(-5, 0, -5),
        radius: 0.5,
        type: 'present',
        height: 2,
        color: new THREE.Color(0xff0000),
      },
    ];

    it('should return false when no obstacles are present', () => {
      const position = new THREE.Vector3(0, 0, 0);
      expect(checkCollision(position, [])).toBe(false);
    });

    it('should return false when far from obstacles', () => {
      const position = new THREE.Vector3(0, 0, 0);
      expect(checkCollision(position, obstacles)).toBe(false);
    });

    it('should return true when colliding with an obstacle', () => {
      // Player at (4.5, 0, 4.5), obstacle at (5, 0, 5) with radius 1
      // Distance is sqrt(0.5^2 + 0.5^2) = sqrt(0.5) ≈ 0.707
      // Combined radius is 0.7 (player) + 1 (obstacle) = 1.7
      // 0.707 < 1.7, so collision
      const position = new THREE.Vector3(4.5, 0, 4.5);
      expect(checkCollision(position, obstacles)).toBe(true);
    });

    it('should return true when exactly at obstacle position', () => {
      const position = new THREE.Vector3(5, 0, 5);
      expect(checkCollision(position, obstacles)).toBe(true);
    });

    it('should respect custom player radius', () => {
      const position = new THREE.Vector3(3.5, 0, 3.5);
      // Distance is sqrt(1.5^2 + 1.5^2) = sqrt(4.5) ≈ 2.12
      // Default player radius 0.7 + 1 = 1.7. 2.12 > 1.7 (No collision)
      expect(checkCollision(position, obstacles)).toBe(false);

      // Large player radius 1.5 + 1 = 2.5. 2.12 < 2.5 (Collision)
      expect(checkCollision(position, obstacles, 1.5)).toBe(true);
    });
  });
});
