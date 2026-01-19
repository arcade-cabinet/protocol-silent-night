/**
 * InstancedMinions - SolidParticleSystem for efficient minion rendering
 *
 * Uses BabylonJS SolidParticleSystem (SPS) for rendering 100+ enemies at 60fps.
 * Grinch-Bot visuals: green body, red eyes, mechanical limbs.
 */

import {
  Scene,
  SolidParticleSystem,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  type SolidParticle,
} from '@babylonjs/core';

import type { EnemyInstance } from './EnemyManager';

/**
 * Configuration for the minion SPS
 */
export interface MinionSPSConfig {
  /** Maximum number of minions to support */
  maxCount: number;
  /** Base scale for minion meshes */
  baseScale: number;
  /** Body color (Grinch green) */
  bodyColor: Color3;
  /** Eye color (red glow) */
  eyeColor: Color3;
}

const DEFAULT_CONFIG: MinionSPSConfig = {
  maxCount: 150,
  baseScale: 1.0,
  bodyColor: new Color3(0.2, 0.6, 0.2), // Grinch green
  eyeColor: new Color3(1.0, 0.1, 0.1), // Red eyes
};

/**
 * Result from creating the minion SPS
 */
export interface MinionSPSResult {
  /** The SolidParticleSystem instance */
  sps: SolidParticleSystem;
  /** Update particle positions and states from enemy data */
  updateParticles: (enemies: EnemyInstance[]) => void;
  /** Dispose of all SPS resources */
  dispose: () => void;
}

/**
 * Create a Grinch-Bot model mesh for the SPS
 * Combines body, head, eyes, and mechanical limbs
 */
function createGrinchBotModel(scene: Scene, config: MinionSPSConfig): Mesh {
  // Create body (cylindrical torso)
  const body = MeshBuilder.CreateCylinder(
    'grinchBody',
    {
      height: 1.2,
      diameterTop: 0.6,
      diameterBottom: 0.8,
      tessellation: 8,
    },
    scene
  );
  body.position.y = 0.6;

  // Create head (sphere with slight elongation)
  const head = MeshBuilder.CreateSphere(
    'grinchHead',
    {
      diameter: 0.7,
      segments: 8,
    },
    scene
  );
  head.position.y = 1.4;
  head.scaling = new Vector3(1, 1.2, 1);

  // Create eyes (small red spheres)
  const leftEye = MeshBuilder.CreateSphere(
    'leftEye',
    { diameter: 0.12, segments: 6 },
    scene
  );
  leftEye.position = new Vector3(-0.15, 1.5, 0.3);

  const rightEye = MeshBuilder.CreateSphere(
    'rightEye',
    { diameter: 0.12, segments: 6 },
    scene
  );
  rightEye.position = new Vector3(0.15, 1.5, 0.3);

  // Create mechanical arms (thin boxes)
  const leftArm = MeshBuilder.CreateBox(
    'leftArm',
    { width: 0.15, height: 0.6, depth: 0.15 },
    scene
  );
  leftArm.position = new Vector3(-0.5, 0.8, 0);
  leftArm.rotation.z = Math.PI / 6;

  const rightArm = MeshBuilder.CreateBox(
    'rightArm',
    { width: 0.15, height: 0.6, depth: 0.15 },
    scene
  );
  rightArm.position = new Vector3(0.5, 0.8, 0);
  rightArm.rotation.z = -Math.PI / 6;

  // Create mechanical legs (thin boxes)
  const leftLeg = MeshBuilder.CreateBox(
    'leftLeg',
    { width: 0.15, height: 0.5, depth: 0.15 },
    scene
  );
  leftLeg.position = new Vector3(-0.2, 0.15, 0);

  const rightLeg = MeshBuilder.CreateBox(
    'rightLeg',
    { width: 0.15, height: 0.5, depth: 0.15 },
    scene
  );
  rightLeg.position = new Vector3(0.2, 0.15, 0);

  // Merge all meshes into one for SPS efficiency
  const merged = Mesh.MergeMeshes(
    [body, head, leftEye, rightEye, leftArm, rightArm, leftLeg, rightLeg],
    true, // dispose source meshes
    true, // allow32BitsIndices
    undefined,
    false, // multiMultiMaterial
    true // multiMaterial materials
  );

  if (!merged) {
    throw new Error('Failed to create Grinch-Bot mesh');
  }

  merged.name = 'grinchBotModel';

  // Create material
  const material = new StandardMaterial('grinchMat', scene);
  material.diffuseColor = config.bodyColor;
  material.emissiveColor = config.bodyColor.scale(0.3);
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  merged.material = material;

  // Hide the model mesh (it's just a template)
  merged.setEnabled(false);

  return merged;
}

/**
 * Create the minion SolidParticleSystem
 *
 * @param scene - BabylonJS scene
 * @param config - Optional configuration overrides
 * @returns MinionSPSResult with SPS and control functions
 */
export function createMinionSPS(
  scene: Scene,
  config: Partial<MinionSPSConfig> = {}
): MinionSPSResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Create the model mesh
  const modelMesh = createGrinchBotModel(scene, cfg);

  // Create SolidParticleSystem
  const sps = new SolidParticleSystem('minionSPS', scene, {
    updatable: true,
    isPickable: false,
  });

  // Add particles using the model
  sps.addShape(modelMesh, cfg.maxCount);

  // Build the SPS mesh
  const spsMesh = sps.buildMesh();
  spsMesh.name = 'minionSPSMesh';

  // Create material for the SPS mesh
  const spsMaterial = new StandardMaterial('spsMinionMat', scene);
  spsMaterial.diffuseColor = cfg.bodyColor;
  spsMaterial.emissiveColor = cfg.bodyColor.scale(0.2);
  spsMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
  spsMesh.material = spsMaterial;

  // Enable frustum culling for performance
  spsMesh.alwaysSelectAsActiveMesh = false;

  // Track enemy ID to particle index mapping
  const enemyToParticle = new Map<string, number>();
  let nextParticleIndex = 0;

  // Initialize all particles as invisible
  sps.initParticles = () => {
    for (let i = 0; i < sps.nbParticles; i++) {
      const particle = sps.particles[i];
      particle.isVisible = false;
      particle.position = Vector3.Zero();
      particle.scaling = new Vector3(cfg.baseScale, cfg.baseScale, cfg.baseScale);
    }
  };

  // Set up particle update function
  sps.updateParticle = (particle: SolidParticle) => {
    // Individual particle updates happen in updateParticles
    return particle;
  };

  // Initialize particles
  sps.initParticles();
  sps.setParticles();

  /**
   * Update all particles to match enemy positions
   */
  const updateParticles = (enemies: EnemyInstance[]) => {
    // Build a set of active enemy IDs
    const activeEnemyIds = new Set<string>();

    for (const enemy of enemies) {
      if (enemy.type !== 'minion' || !enemy.isActive) continue;

      activeEnemyIds.add(enemy.id);

      // Get or assign particle index
      let particleIndex = enemyToParticle.get(enemy.id);

      if (particleIndex === undefined) {
        // Find an available particle
        if (nextParticleIndex < cfg.maxCount) {
          particleIndex = nextParticleIndex++;
          enemyToParticle.set(enemy.id, particleIndex);
        } else {
          // Reuse a particle from a dead enemy
          for (const [id, idx] of enemyToParticle.entries()) {
            if (!activeEnemyIds.has(id)) {
              enemyToParticle.delete(id);
              particleIndex = idx;
              enemyToParticle.set(enemy.id, particleIndex);
              break;
            }
          }
        }

        if (particleIndex === undefined) {
          // No particles available, skip this enemy
          continue;
        }
      }

      const particle = sps.particles[particleIndex];
      if (!particle) continue;

      // Update particle position
      particle.position.x = enemy.position.x;
      particle.position.y = enemy.position.y;
      particle.position.z = enemy.position.z;

      // Calculate rotation to face movement direction
      if (
        Math.abs(enemy.velocity.x) > 0.01 ||
        Math.abs(enemy.velocity.z) > 0.01
      ) {
        particle.rotation.y = Math.atan2(enemy.velocity.x, enemy.velocity.z);
      }

      // Scale based on HP percentage (shrink as damaged)
      const hpPercent = enemy.hp / enemy.maxHp;
      const scale = cfg.baseScale * (0.7 + 0.3 * hpPercent);
      particle.scaling.x = scale;
      particle.scaling.y = scale;
      particle.scaling.z = scale;

      // Make visible
      particle.isVisible = true;
    }

    // Hide particles for dead/inactive enemies
    for (const [id, idx] of enemyToParticle.entries()) {
      if (!activeEnemyIds.has(id)) {
        const particle = sps.particles[idx];
        if (particle) {
          particle.isVisible = false;
        }
        enemyToParticle.delete(id);
      }
    }

    // Apply changes to mesh
    sps.setParticles();
  };

  /**
   * Dispose of SPS resources
   */
  const dispose = () => {
    enemyToParticle.clear();
    sps.dispose();
    modelMesh.dispose();
  };

  return {
    sps,
    updateParticles,
    dispose,
  };
}

/**
 * Create a simple box-based SPS for even higher performance
 * Use this for very low-end devices
 */
export function createSimpleMinionSPS(
  scene: Scene,
  maxCount: number = 200
): MinionSPSResult {
  // Simple box model
  const boxModel = MeshBuilder.CreateBox(
    'simpleMinionModel',
    { size: 1.5 },
    scene
  );
  boxModel.setEnabled(false);

  const sps = new SolidParticleSystem('simpleMinionSPS', scene, {
    updatable: true,
    isPickable: false,
  });

  sps.addShape(boxModel, maxCount);
  const spsMesh = sps.buildMesh();

  const material = new StandardMaterial('simpleMinionMat', scene);
  material.diffuseColor = new Color3(0.2, 0.6, 0.2);
  material.emissiveColor = new Color3(0.1, 0.3, 0.1);
  spsMesh.material = material;

  const enemyToParticle = new Map<string, number>();
  let nextIndex = 0;

  sps.initParticles = () => {
    for (let i = 0; i < sps.nbParticles; i++) {
      sps.particles[i].isVisible = false;
    }
  };

  sps.initParticles();
  sps.setParticles();

  const updateParticles = (enemies: EnemyInstance[]) => {
    const activeIds = new Set<string>();

    for (const enemy of enemies) {
      if (enemy.type !== 'minion' || !enemy.isActive) continue;
      activeIds.add(enemy.id);

      let idx = enemyToParticle.get(enemy.id);
      if (idx === undefined && nextIndex < maxCount) {
        idx = nextIndex++;
        enemyToParticle.set(enemy.id, idx);
      }

      if (idx === undefined) continue;

      const p = sps.particles[idx];
      if (!p) continue;

      p.position.x = enemy.position.x;
      p.position.y = enemy.position.y + 0.75;
      p.position.z = enemy.position.z;
      p.isVisible = true;

      if (Math.abs(enemy.velocity.x) > 0.01 || Math.abs(enemy.velocity.z) > 0.01) {
        p.rotation.y = Math.atan2(enemy.velocity.x, enemy.velocity.z);
      }
    }

    for (const [id, idx] of enemyToParticle.entries()) {
      if (!activeIds.has(id)) {
        const p = sps.particles[idx];
        if (p) p.isVisible = false;
        enemyToParticle.delete(id);
      }
    }

    sps.setParticles();
  };

  const dispose = () => {
    enemyToParticle.clear();
    sps.dispose();
    boxModel.dispose();
  };

  return { sps, updateParticles, dispose };
}
