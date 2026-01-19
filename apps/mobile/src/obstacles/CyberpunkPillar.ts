/**
 * @fileoverview Cyberpunk tech pillar obstacle mesh
 * @module obstacles/CyberpunkPillar
 *
 * Creates a futuristic tech pillar with neon accents,
 * circuit patterns, and holographic elements.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  DynamicTexture,
} from '@babylonjs/core';

/**
 * Configuration for cyberpunk pillar
 */
export interface CyberpunkPillarConfig {
  /** Height of the pillar */
  height: number;
  /** Radius of the pillar */
  radius: number;
  /** Primary color (hex string) */
  color: string;
  /** Accent color for neon elements (hex string) */
  accentColor?: string;
  /** Emissive intensity (0-1) */
  emissiveIntensity?: number;
  /** Number of vertical segments */
  segments?: number;
  /** Enable circuit pattern */
  enableCircuits?: boolean;
}

/**
 * Default pillar configuration
 */
const DEFAULT_PILLAR_CONFIG: CyberpunkPillarConfig = {
  height: 8,
  radius: 0.6,
  color: '#00ffcc',
  accentColor: '#ff0066',
  emissiveIntensity: 0.6,
  segments: 4,
  enableCircuits: true,
};

/**
 * Converts hex color to Color3
 */
function hexToColor3(hex: string): Color3 {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return new Color3(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
  return new Color3(0, 1, 0.8); // Default cyan
}

/**
 * Creates a cyberpunk tech pillar template mesh
 *
 * The pillar features a hexagonal base with glowing segments,
 * circuit-like patterns, and holographic ring accents.
 *
 * @param scene - BabylonJS scene
 * @param config - Pillar configuration
 * @returns Template mesh for instancing
 *
 * @example
 * ```typescript
 * const pillarTemplate = createCyberpunkPillar(scene, {
 *   height: 10,
 *   color: '#00ffcc',
 * });
 *
 * const instance = pillarTemplate.createInstance('pillar1');
 * instance.position.set(15, 0, 8);
 * ```
 */
export function createCyberpunkPillar(
  scene: Scene,
  config: Partial<CyberpunkPillarConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_PILLAR_CONFIG, ...config };
  const { height, radius, color, accentColor, emissiveIntensity, segments, enableCircuits } = cfg;

  // Create parent mesh
  const pillar = new Mesh('cyberpunkPillar', scene);

  const primaryColor = hexToColor3(color);
  const secondaryColor = hexToColor3(accentColor ?? '#ff0066');

  // Hexagonal base
  const baseHeight = height * 0.05;
  const baseRadius = radius * 1.3;
  const base = MeshBuilder.CreateCylinder(
    'base',
    {
      height: baseHeight,
      diameter: baseRadius * 2,
      tessellation: 6, // Hexagonal
    },
    scene
  );
  base.position.y = baseHeight / 2;
  base.parent = pillar;

  // Base material (dark with accent glow)
  const baseMat = new StandardMaterial('baseMat', scene);
  baseMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
  baseMat.emissiveColor = primaryColor.scale(emissiveIntensity! * 0.3);
  base.material = baseMat;

  // Main pillar body segments
  const segmentHeight = (height - baseHeight * 2) / segments!;
  const gapHeight = segmentHeight * 0.1;

  for (let i = 0; i < segments!; i++) {
    const y = baseHeight + i * segmentHeight + (segmentHeight - gapHeight) / 2;

    // Segment cylinder
    const segment = MeshBuilder.CreateCylinder(
      `segment_${i}`,
      {
        height: segmentHeight - gapHeight,
        diameter: radius * 2,
        tessellation: 6,
      },
      scene
    );
    segment.position.y = y;
    segment.parent = pillar;

    // Segment material with gradient effect
    const segmentMat = new StandardMaterial(`segmentMat_${i}`, scene);
    const brightness = 0.7 + (i / segments!) * 0.3;
    segmentMat.diffuseColor = primaryColor.scale(brightness * 0.3);
    segmentMat.emissiveColor = primaryColor.scale(emissiveIntensity! * brightness);
    segmentMat.specularColor = new Color3(0.3, 0.3, 0.3);
    segment.material = segmentMat;

    // Add circuit texture if enabled
    if (enableCircuits) {
      const circuitTexture = createCircuitTexture(scene, primaryColor);
      segmentMat.emissiveTexture = circuitTexture;
    }

    // Glowing ring between segments
    if (i > 0) {
      const ring = MeshBuilder.CreateTorus(
        `ring_${i}`,
        {
          diameter: radius * 2.2,
          thickness: gapHeight * 0.8,
          tessellation: 6,
        },
        scene
      );
      ring.position.y = baseHeight + i * segmentHeight - gapHeight / 2;
      ring.rotation.x = Math.PI / 2;
      ring.parent = pillar;

      const ringMat = new StandardMaterial(`ringMat_${i}`, scene);
      ringMat.diffuseColor = secondaryColor;
      ringMat.emissiveColor = secondaryColor.scale(emissiveIntensity!);
      ring.material = ringMat;
    }
  }

  // Top cap
  const cap = MeshBuilder.CreateCylinder(
    'cap',
    {
      height: baseHeight,
      diameterTop: radius * 0.8,
      diameterBottom: radius * 1.2,
      tessellation: 6,
    },
    scene
  );
  cap.position.y = height - baseHeight / 2;
  cap.parent = pillar;

  const capMat = new StandardMaterial('capMat', scene);
  capMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
  capMat.emissiveColor = primaryColor.scale(emissiveIntensity! * 0.5);
  cap.material = capMat;

  // Holographic rings (floating decorative elements)
  addHolographicRings(pillar, scene, height, radius, primaryColor, secondaryColor, emissiveIntensity!);

  // Data stream particles (small cubes)
  addDataStreamCubes(pillar, scene, height, radius, primaryColor, emissiveIntensity!);

  return pillar;
}

/**
 * Creates a circuit board pattern texture
 */
function createCircuitTexture(scene: Scene, color: Color3): DynamicTexture {
  const size = 256;
  const texture = new DynamicTexture('circuitTexture', size, scene, true);
  const ctx = texture.getContext();

  // Clear with transparent
  ctx.clearRect(0, 0, size, size);

  // Circuit line color
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);

  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
  ctx.lineWidth = 2;

  // Draw circuit-like patterns
  const gridSize = size / 8;

  // Horizontal lines
  for (let y = gridSize; y < size; y += gridSize * 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);

    let x = 0;
    while (x < size) {
      const length = gridSize * (1 + Math.random());
      x += length;
      ctx.lineTo(Math.min(x, size), y);

      if (x < size && Math.random() > 0.5) {
        // Vertical segment
        const vLength = gridSize * (Math.random() > 0.5 ? 1 : -1);
        ctx.lineTo(x, y + vLength);
        ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Vertical lines
  for (let x = gridSize; x < size; x += gridSize * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);

    let y = 0;
    while (y < size) {
      const length = gridSize * (1 + Math.random());
      y += length;
      ctx.lineTo(x, Math.min(y, size));

      if (y < size && Math.random() > 0.5) {
        // Horizontal segment
        const hLength = gridSize * (Math.random() > 0.5 ? 1 : -1);
        ctx.lineTo(x + hLength, y);
        ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Add nodes (small circles)
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  for (let x = gridSize; x < size; x += gridSize) {
    for (let y = gridSize; y < size; y += gridSize) {
      if (Math.random() > 0.7) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  texture.update();
  return texture;
}

/**
 * Adds floating holographic ring decorations
 */
function addHolographicRings(
  parent: Mesh,
  scene: Scene,
  height: number,
  radius: number,
  primaryColor: Color3,
  secondaryColor: Color3,
  emissiveIntensity: number
): void {
  const ringCount = 3;

  for (let i = 0; i < ringCount; i++) {
    const y = height * 0.3 + (height * 0.5 * i) / ringCount;
    const ringRadius = radius * (1.5 + i * 0.2);

    const ring = MeshBuilder.CreateTorus(
      `holoRing_${i}`,
      {
        diameter: ringRadius * 2,
        thickness: 0.05,
        tessellation: 32,
      },
      scene
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    // Slight tilt for visual interest
    ring.rotation.z = 0.1 * (i % 2 === 0 ? 1 : -1);
    ring.parent = parent;

    const ringMat = new StandardMaterial(`holoRingMat_${i}`, scene);
    const color = i % 2 === 0 ? primaryColor : secondaryColor;
    ringMat.diffuseColor = color.scale(0.5);
    ringMat.emissiveColor = color.scale(emissiveIntensity * 0.7);
    ringMat.alpha = 0.7;
    ring.material = ringMat;
  }
}

/**
 * Adds small data stream cubes around pillar
 */
function addDataStreamCubes(
  parent: Mesh,
  scene: Scene,
  height: number,
  radius: number,
  color: Color3,
  emissiveIntensity: number
): void {
  const cubeCount = 8;
  const cubeSize = 0.08;

  for (let i = 0; i < cubeCount; i++) {
    const angle = (i / cubeCount) * Math.PI * 2;
    const distance = radius * 1.4;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = height * 0.2 + Math.random() * height * 0.6;

    const cube = MeshBuilder.CreateBox(
      `dataCube_${i}`,
      { size: cubeSize },
      scene
    );
    cube.position.set(x, y, z);
    cube.rotation.y = angle;
    cube.parent = parent;

    const cubeMat = new StandardMaterial(`dataCubeMat_${i}`, scene);
    cubeMat.diffuseColor = color;
    cubeMat.emissiveColor = color.scale(emissiveIntensity);
    cube.material = cubeMat;
  }
}

/**
 * Creates a simplified pillar for distant/low-detail rendering
 *
 * @param scene - BabylonJS scene
 * @param config - Pillar configuration
 * @returns Simplified mesh
 */
export function createSimpleCyberpunkPillar(
  scene: Scene,
  config: Partial<CyberpunkPillarConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_PILLAR_CONFIG, ...config };
  const { height, radius, color, emissiveIntensity } = cfg;

  const pillar = MeshBuilder.CreateCylinder(
    'simplePillar',
    {
      height,
      diameter: radius * 2,
      tessellation: 6,
    },
    scene
  );
  pillar.position.y = height / 2;

  const primaryColor = hexToColor3(color);
  const mat = new StandardMaterial('simplePillarMat', scene);
  mat.diffuseColor = primaryColor.scale(0.3);
  mat.emissiveColor = primaryColor.scale(emissiveIntensity ?? 0.6);
  pillar.material = mat;

  return pillar;
}

/**
 * Creates a damaged/glitched pillar variant
 *
 * @param scene - BabylonJS scene
 * @param config - Base pillar configuration
 * @returns Glitched pillar mesh
 */
export function createGlitchedPillar(
  scene: Scene,
  config: Partial<CyberpunkPillarConfig> = {}
): Mesh {
  const pillar = createCyberpunkPillar(scene, {
    ...config,
    accentColor: '#ff0000', // Red accent for damaged look
  });

  // Add some visual glitch elements
  const glitchCount = 3;
  const cfg = { ...DEFAULT_PILLAR_CONFIG, ...config };

  for (let i = 0; i < glitchCount; i++) {
    const glitch = MeshBuilder.CreateBox(
      `glitch_${i}`,
      {
        width: cfg.radius * 2 * Math.random(),
        height: 0.1,
        depth: cfg.radius * 2 * Math.random(),
      },
      scene
    );
    glitch.position.y = Math.random() * cfg.height;
    glitch.position.x = (Math.random() - 0.5) * cfg.radius;
    glitch.position.z = (Math.random() - 0.5) * cfg.radius;
    glitch.parent = pillar;

    const glitchMat = new StandardMaterial(`glitchMat_${i}`, scene);
    glitchMat.diffuseColor = new Color3(1, 0, 0);
    glitchMat.emissiveColor = new Color3(1, 0, 0);
    glitchMat.alpha = 0.7;
    glitch.material = glitchMat;
  }

  return pillar;
}
