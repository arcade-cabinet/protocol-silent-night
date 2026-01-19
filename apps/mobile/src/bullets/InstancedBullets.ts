/**
 * InstancedBullets - SolidParticleSystem for efficient bullet rendering
 *
 * Uses BabylonJS SolidParticleSystem (SPS) for instanced rendering of bullets.
 * Each bullet type has its own SPS for different visual styles.
 *
 * Performance: SPS can render 1000s of particles with a single draw call,
 * critical for achieving 200+ active bullets at 60fps on mobile.
 */

import {
  Scene,
  SolidParticleSystem,
  SolidParticle,
  Mesh,
  Vector3,
  Color4,
  GlowLayer,
} from '@babylonjs/core';
import {
  BULLET_TEMPLATE_CREATORS,
  BULLET_CONFIGS,
  type BulletTemplateCreator,
} from './BulletVisuals';

/**
 * Bullet instance data for updating SPS particles
 */
export interface BulletInstance {
  id: string;
  type: string;
  position: Vector3;
  velocity: Vector3;
  damage: number;
  life: number;
  maxLife: number;
  scale?: number;
  rotation?: Vector3;
}

/**
 * Configuration for creating a bullet SPS
 */
export interface BulletSPSConfig {
  scene: Scene;
  bulletType: string;
  maxCount: number;
  enableGlow?: boolean;
}

/**
 * Result from creating a bullet SPS
 */
export interface BulletSPSResult {
  sps: SolidParticleSystem;
  mesh: Mesh;
  updateParticles: (bullets: BulletInstance[]) => void;
  dispose: () => void;
}

/**
 * Create a SolidParticleSystem for a specific bullet type
 *
 * @param config - Configuration for the SPS
 * @returns SPS and update function
 */
export function createBulletSPS(config: BulletSPSConfig): BulletSPSResult {
  const { scene, bulletType, maxCount, enableGlow = true } = config;

  // Get or create the template creator
  const templateCreator: BulletTemplateCreator =
    BULLET_TEMPLATE_CREATORS[bulletType] || BULLET_TEMPLATE_CREATORS.cannon;

  // Create the template mesh
  const template = templateCreator(scene);
  template.setEnabled(false); // Template is not rendered directly

  // Create the SolidParticleSystem
  const sps = new SolidParticleSystem(`${bulletType}SPS`, scene, {
    isPickable: false,
    enableDepthSort: false,
    enableMultiMaterial: false,
    updatable: true,
    useModelMaterial: true,
  });

  // Add particles using the template
  sps.addShape(template, maxCount);

  // Build the mesh
  const spsMesh = sps.buildMesh();
  spsMesh.hasVertexAlpha = true;
  spsMesh.isPickable = false;

  // Dispose of the template - it's no longer needed
  template.dispose();

  // Set up glow layer for emissive bullets
  let glowLayer: GlowLayer | null = null;
  if (enableGlow) {
    glowLayer = new GlowLayer(`${bulletType}Glow`, scene, {
      mainTextureFixedSize: 256,
      blurKernelSize: 32,
    });
    glowLayer.intensity = 1.0;
    glowLayer.addIncludedOnlyMesh(spsMesh);
  }

  // Get the emissive color for this bullet type
  const bulletConfig = BULLET_CONFIGS[bulletType] || BULLET_CONFIGS.cannon;
  const emissiveColor = new Color4(
    bulletConfig.emissiveColor.r,
    bulletConfig.emissiveColor.g,
    bulletConfig.emissiveColor.b,
    1
  );
  const hiddenColor = new Color4(0, 0, 0, 0);

  // Initialize all particles as hidden
  sps.initParticles = () => {
    for (let i = 0; i < sps.nbParticles; i++) {
      const p = sps.particles[i];
      p.isVisible = false;
      p.position.setAll(0);
      p.scaling.setAll(0);
      p.color = hiddenColor.clone();
    }
  };

  sps.initParticles();
  sps.setParticles();

  // Map of bullet ID to particle index for efficient updates
  const bulletToParticle = new Map<string, number>();
  let nextParticleIndex = 0;

  /**
   * Update particles to match current bullet instances
   *
   * This function syncs the SPS particles with the active bullets,
   * handling creation, movement, and removal efficiently.
   */
  const updateParticles = (bullets: BulletInstance[]): void => {
    // Build a set of active bullet IDs
    const activeBulletIds = new Set(
      bullets.filter((b) => b.type === bulletType).map((b) => b.id)
    );

    // Remove particles for bullets that no longer exist
    const toDelete: string[] = [];
    bulletToParticle.forEach((particleIndex, bulletId) => {
      if (!activeBulletIds.has(bulletId)) {
        const p = sps.particles[particleIndex];
        p.isVisible = false;
        p.scaling.setAll(0);
        p.color = hiddenColor.clone();
        toDelete.push(bulletId);
      }
    });
    toDelete.forEach((id) => bulletToParticle.delete(id));

    // Update or create particles for active bullets
    for (const bullet of bullets) {
      // Only process bullets of this type
      if (bullet.type !== bulletType) continue;

      let particleIndex: number | undefined = bulletToParticle.get(bullet.id);

      // Allocate new particle if needed
      if (particleIndex === undefined) {
        // Find an unused particle
        let foundIndex = -1;
        for (let i = 0; i < maxCount; i++) {
          const idx = (nextParticleIndex + i) % maxCount;
          if (!sps.particles[idx].isVisible) {
            foundIndex = idx;
            nextParticleIndex = (idx + 1) % maxCount;
            break;
          }
        }

        if (foundIndex < 0) {
          // All particles in use - skip this bullet
          console.warn(`${bulletType}SPS: No available particles`);
          continue;
        }

        particleIndex = foundIndex;
        bulletToParticle.set(bullet.id, particleIndex);
      }

      const p = sps.particles[particleIndex];
      p.isVisible = true;

      // Update position
      p.position.copyFrom(bullet.position);

      // Update scale (with optional per-bullet scale)
      const baseScale = bullet.scale ?? 1;
      p.scaling.setAll(baseScale);

      // Update rotation based on velocity direction
      if (bullet.velocity.lengthSquared() > 0.001) {
        // Point bullet in direction of travel
        const angle = Math.atan2(bullet.velocity.x, bullet.velocity.z);
        p.rotation.y = angle;
      }
      if (bullet.rotation) {
        p.rotation.copyFrom(bullet.rotation);
      }

      // Update color/alpha based on remaining life (fade out effect)
      const lifeRatio = bullet.life / bullet.maxLife;
      p.color = emissiveColor.clone();
      p.color.a = Math.min(1, lifeRatio * 2); // Fade in last 50% of life
    }

    // Commit changes to the GPU
    sps.setParticles();
  };

  /**
   * Clean up resources
   */
  const dispose = (): void => {
    bulletToParticle.clear();
    glowLayer?.dispose();
    sps.dispose();
  };

  return {
    sps,
    mesh: spsMesh,
    updateParticles,
    dispose,
  };
}

/**
 * Manager for multiple bullet type SPS instances
 */
export class BulletSPSManager {
  private scene: Scene;
  private spsSystems: Map<string, BulletSPSResult>;
  private maxPerType: number;

  constructor(scene: Scene, maxPerType: number = 100) {
    this.scene = scene;
    this.spsSystems = new Map();
    this.maxPerType = maxPerType;
  }

  /**
   * Get or create SPS for a bullet type
   */
  getOrCreateSPS(bulletType: string): BulletSPSResult {
    let spsResult = this.spsSystems.get(bulletType);
    if (!spsResult) {
      spsResult = createBulletSPS({
        scene: this.scene,
        bulletType,
        maxCount: this.maxPerType,
        enableGlow: true,
      });
      this.spsSystems.set(bulletType, spsResult);
    }
    return spsResult;
  }

  /**
   * Update all SPS systems with current bullets
   */
  updateAll(bullets: BulletInstance[]): void {
    // Group bullets by type
    const bulletsByType = new Map<string, BulletInstance[]>();
    for (const bullet of bullets) {
      const typeGroup = bulletsByType.get(bullet.type) || [];
      typeGroup.push(bullet);
      bulletsByType.set(bullet.type, typeGroup);
    }

    // Update each SPS with its bullets
    this.spsSystems.forEach((spsResult, type) => {
      const typeBullets = bulletsByType.get(type) || [];
      spsResult.updateParticles(typeBullets);
    });

    // Also ensure any new bullet types get their SPS created
    bulletsByType.forEach((typeBullets, type) => {
      if (!this.spsSystems.has(type)) {
        const spsResult = this.getOrCreateSPS(type);
        spsResult.updateParticles(typeBullets);
      }
    });
  }

  /**
   * Pre-initialize SPS for common bullet types
   */
  warmUp(types: string[] = ['cannon', 'smg', 'star']): void {
    for (const type of types) {
      this.getOrCreateSPS(type);
    }
  }

  /**
   * Get total particle count across all systems
   */
  getTotalParticleCount(): number {
    let total = 0;
    this.spsSystems.forEach((spsResult) => {
      total += spsResult.sps.nbParticles;
    });
    return total;
  }

  /**
   * Clean up all SPS systems
   */
  dispose(): void {
    this.spsSystems.forEach((spsResult) => {
      spsResult.dispose();
    });
    this.spsSystems.clear();
  }
}

/**
 * Create a simple particle trail effect for fast-moving bullets
 *
 * This creates a secondary SPS for trail particles that follow bullets
 */
export function createBulletTrailSPS(
  scene: Scene,
  color: Color4,
  maxTrailPoints: number = 500
): {
  addTrailPoint: (position: Vector3, scale: number) => void;
  update: (deltaTime: number) => void;
  dispose: () => void;
} {
  // Create a simple sphere for trail particles
  const trailTemplate = Mesh.CreateSphere('trailTemplate', 4, 0.1, scene);
  trailTemplate.setEnabled(false);

  const sps = new SolidParticleSystem('trailSPS', scene, {
    isPickable: false,
    updatable: true,
  });

  sps.addShape(trailTemplate, maxTrailPoints);
  const spsMesh = sps.buildMesh();
  spsMesh.hasVertexAlpha = true;
  trailTemplate.dispose();

  // Trail particle data
  interface TrailParticle {
    life: number;
    maxLife: number;
  }
  const trailData: TrailParticle[] = [];
  let nextIndex = 0;

  // Initialize particles
  for (let i = 0; i < maxTrailPoints; i++) {
    trailData.push({ life: 0, maxLife: 0.3 });
    const p = sps.particles[i];
    p.isVisible = false;
    p.scaling.setAll(0);
  }
  sps.setParticles();

  const addTrailPoint = (position: Vector3, scale: number): void => {
    const p = sps.particles[nextIndex];
    p.isVisible = true;
    p.position.copyFrom(position);
    p.scaling.setAll(scale * 0.5);
    p.color = color.clone();

    trailData[nextIndex].life = trailData[nextIndex].maxLife;
    nextIndex = (nextIndex + 1) % maxTrailPoints;
  };

  const update = (deltaTime: number): void => {
    for (let i = 0; i < maxTrailPoints; i++) {
      const data = trailData[i];
      if (data.life > 0) {
        data.life -= deltaTime;
        const p = sps.particles[i];
        const lifeRatio = data.life / data.maxLife;
        p.scaling.setAll(lifeRatio * 0.3);
        p.color!.a = lifeRatio;
        if (data.life <= 0) {
          p.isVisible = false;
          p.scaling.setAll(0);
        }
      }
    }
    sps.setParticles();
  };

  const dispose = (): void => {
    sps.dispose();
  };

  return { addTrailPoint, update, dispose };
}
