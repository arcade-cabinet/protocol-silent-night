import * as THREE from 'three';
import type { ChristmasObjectType } from '../types';

export interface ObstacleTypeConfig {
  type: ChristmasObjectType;
  color: number | string;
  heightRange: [number, number];
  radius: number;
  scale: [number, number, number];
  yOffset: number;
}

export const TERRAIN_CONFIG = {
  gridSize: 80,
  cubeSize: 1.8,
  cubeHeight: 4,
  noiseScale: 0.1,
  detailNoiseScale: 0.05,
  heightMultiplier: 2,
  detailHeightMultiplier: 1.5,
  baseElevation: -3,
  glitchChance: 0.005,
  obstacleThreshold: 0.92,
};

export const OBSTACLE_TYPES: Record<string, ObstacleTypeConfig> = {
  present_red: {
    type: 'present',
    color: 0xff0044,
    heightRange: [2, 4],
    radius: 0.9,
    scale: [1.2, 1, 1.2],
    yOffset: 1,
  },
  present_green: {
    type: 'present',
    color: 0x00ff88,
    heightRange: [2, 4],
    radius: 0.9,
    scale: [1.2, 1, 1.2],
    yOffset: 1,
  },
  tree: {
    type: 'tree',
    color: 0x00aa44,
    heightRange: [4, 8],
    radius: 1.2,
    scale: [1, 1, 1],
    yOffset: 2,
  },
  candy_cane: {
    type: 'candy_cane',
    color: 0xff4477,
    heightRange: [3, 5],
    radius: 0.9,
    scale: [0.5, 1, 0.5],
    yOffset: 1.5,
  },
  pillar: {
    type: 'pillar',
    color: 0x00ffcc,
    heightRange: [5, 10],
    radius: 0.9,
    scale: [1, 1, 1],
    yOffset: 0, // Calculated based on height
  },
};
