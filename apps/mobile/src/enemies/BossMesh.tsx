/**
 * BossMesh - Articulated Krampus-Prime boss enemy
 *
 * Large horned demon mech with multiple attack animations.
 * Includes health bar integration and phase-based visual changes.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Animation,
  AnimationGroup,
  TransformNode,
  type Nullable,
} from '@babylonjs/core';

/**
 * Configuration for Krampus-Prime appearance
 */
export interface BossConfig {
  /** Overall scale multiplier */
  scale: number;
  /** Main body color */
  bodyColor: Color3;
  /** Horn and accent color */
  accentColor: Color3;
  /** Eye glow color */
  eyeColor: Color3;
  /** Mechanical parts color */
  metalColor: Color3;
}

const DEFAULT_BOSS_CONFIG: BossConfig = {
  scale: 3.0,
  bodyColor: new Color3(0.3, 0.1, 0.1), // Dark red body
  accentColor: new Color3(0.1, 0.1, 0.1), // Black horns
  eyeColor: new Color3(1.0, 0.8, 0.0), // Yellow glowing eyes
  metalColor: new Color3(0.4, 0.4, 0.5), // Metallic grey
};

/**
 * Result from creating the boss mesh
 */
export interface BossMeshResult {
  /** Root transform node for the boss */
  root: TransformNode;
  /** Main body mesh */
  mesh: Mesh;
  /** Set the boss world position */
  setPosition: (pos: Vector3) => void;
  /** Set rotation to face a direction */
  setRotation: (angle: number) => void;
  /** Play the slam attack animation */
  playAttackAnimation: () => void;
  /** Play the barrage windup animation */
  playBarrageAnimation: () => void;
  /** Play damage flash animation */
  playDamageFlash: () => void;
  /** Update health bar percentage (0-1) */
  setHealthPercent: (percent: number) => void;
  /** Set rage mode visual (below 25% HP) */
  setRageMode: (enabled: boolean) => void;
  /** Clean up all resources */
  dispose: () => void;
}

/**
 * Create the Krampus-Prime boss mesh with animations
 *
 * @param scene - BabylonJS scene
 * @param config - Optional appearance configuration
 * @returns BossMeshResult with mesh and control functions
 */
export function createBossMesh(
  scene: Scene,
  config: Partial<BossConfig> = {}
): BossMeshResult {
  const cfg = { ...DEFAULT_BOSS_CONFIG, ...config };

  // Create root transform node for positioning
  const root = new TransformNode('krampusPrime', scene);

  // Create materials
  const bodyMaterial = new StandardMaterial('bossBodyMat', scene);
  bodyMaterial.diffuseColor = cfg.bodyColor;
  bodyMaterial.emissiveColor = cfg.bodyColor.scale(0.2);
  bodyMaterial.specularColor = new Color3(0.3, 0.3, 0.3);

  const accentMaterial = new StandardMaterial('bossAccentMat', scene);
  accentMaterial.diffuseColor = cfg.accentColor;
  accentMaterial.emissiveColor = cfg.accentColor.scale(0.1);

  const metalMaterial = new StandardMaterial('bossMetalMat', scene);
  metalMaterial.diffuseColor = cfg.metalColor;
  metalMaterial.specularColor = new Color3(0.8, 0.8, 0.8);
  metalMaterial.specularPower = 64;

  const eyeMaterial = new StandardMaterial('bossEyeMat', scene);
  eyeMaterial.emissiveColor = cfg.eyeColor;
  eyeMaterial.diffuseColor = cfg.eyeColor;

  // Scale factor
  const s = cfg.scale;

  // Create torso (main body)
  const torso = MeshBuilder.CreateBox(
    'bossTorso',
    { width: 2 * s, height: 2.5 * s, depth: 1.5 * s },
    scene
  );
  torso.position.y = 2.5 * s;
  torso.material = bodyMaterial;
  torso.parent = root;

  // Create head
  const head = MeshBuilder.CreateSphere(
    'bossHead',
    { diameter: 1.2 * s, segments: 12 },
    scene
  );
  head.position.y = 4.2 * s;
  head.scaling = new Vector3(1, 1.3, 1);
  head.material = bodyMaterial;
  head.parent = root;

  // Create horns
  const leftHorn = MeshBuilder.CreateCylinder(
    'leftHorn',
    {
      height: 1.5 * s,
      diameterTop: 0.05 * s,
      diameterBottom: 0.3 * s,
      tessellation: 8,
    },
    scene
  );
  leftHorn.position = new Vector3(-0.4 * s, 4.8 * s, 0);
  leftHorn.rotation = new Vector3(0, 0, Math.PI / 4);
  leftHorn.material = accentMaterial;
  leftHorn.parent = root;

  const rightHorn = MeshBuilder.CreateCylinder(
    'rightHorn',
    {
      height: 1.5 * s,
      diameterTop: 0.05 * s,
      diameterBottom: 0.3 * s,
      tessellation: 8,
    },
    scene
  );
  rightHorn.position = new Vector3(0.4 * s, 4.8 * s, 0);
  rightHorn.rotation = new Vector3(0, 0, -Math.PI / 4);
  rightHorn.material = accentMaterial;
  rightHorn.parent = root;

  // Create glowing eyes
  const leftEye = MeshBuilder.CreateSphere(
    'bossLeftEye',
    { diameter: 0.2 * s, segments: 8 },
    scene
  );
  leftEye.position = new Vector3(-0.25 * s, 4.3 * s, 0.5 * s);
  leftEye.material = eyeMaterial;
  leftEye.parent = root;

  const rightEye = MeshBuilder.CreateSphere(
    'bossRightEye',
    { diameter: 0.2 * s, segments: 8 },
    scene
  );
  rightEye.position = new Vector3(0.25 * s, 4.3 * s, 0.5 * s);
  rightEye.material = eyeMaterial;
  rightEye.parent = root;

  // Create mechanical arms
  const armLength = 2.5 * s;
  const armWidth = 0.4 * s;

  // Left arm pivot
  const leftArmPivot = new TransformNode('leftArmPivot', scene);
  leftArmPivot.position = new Vector3(-1.2 * s, 3.5 * s, 0);
  leftArmPivot.parent = root;

  const leftArm = MeshBuilder.CreateBox(
    'bossLeftArm',
    { width: armWidth, height: armLength, depth: armWidth },
    scene
  );
  leftArm.position.y = -armLength / 2;
  leftArm.material = metalMaterial;
  leftArm.parent = leftArmPivot;

  // Left claw
  const leftClaw = MeshBuilder.CreateBox(
    'leftClaw',
    { width: 0.8 * s, height: 0.6 * s, depth: 0.3 * s },
    scene
  );
  leftClaw.position.y = -armLength - 0.3 * s;
  leftClaw.material = accentMaterial;
  leftClaw.parent = leftArmPivot;

  // Right arm pivot
  const rightArmPivot = new TransformNode('rightArmPivot', scene);
  rightArmPivot.position = new Vector3(1.2 * s, 3.5 * s, 0);
  rightArmPivot.parent = root;

  const rightArm = MeshBuilder.CreateBox(
    'bossRightArm',
    { width: armWidth, height: armLength, depth: armWidth },
    scene
  );
  rightArm.position.y = -armLength / 2;
  rightArm.material = metalMaterial;
  rightArm.parent = rightArmPivot;

  // Right claw
  const rightClaw = MeshBuilder.CreateBox(
    'rightClaw',
    { width: 0.8 * s, height: 0.6 * s, depth: 0.3 * s },
    scene
  );
  rightClaw.position.y = -armLength - 0.3 * s;
  rightClaw.material = accentMaterial;
  rightClaw.parent = rightArmPivot;

  // Create legs
  const legLength = 2 * s;

  const leftLeg = MeshBuilder.CreateBox(
    'bossLeftLeg',
    { width: 0.6 * s, height: legLength, depth: 0.6 * s },
    scene
  );
  leftLeg.position = new Vector3(-0.5 * s, legLength / 2, 0);
  leftLeg.material = metalMaterial;
  leftLeg.parent = root;

  const rightLeg = MeshBuilder.CreateBox(
    'bossRightLeg',
    { width: 0.6 * s, height: legLength, depth: 0.6 * s },
    scene
  );
  rightLeg.position = new Vector3(0.5 * s, legLength / 2, 0);
  rightLeg.material = metalMaterial;
  rightLeg.parent = root;

  // Create health bar (floating above head)
  const healthBarBg = MeshBuilder.CreatePlane(
    'healthBarBg',
    { width: 3 * s, height: 0.3 * s },
    scene
  );
  healthBarBg.position.y = 5.5 * s;
  healthBarBg.billboardMode = Mesh.BILLBOARDMODE_Y;
  const healthBarBgMat = new StandardMaterial('healthBgMat', scene);
  healthBarBgMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
  healthBarBgMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
  healthBarBg.material = healthBarBgMat;
  healthBarBg.parent = root;

  const healthBarFg = MeshBuilder.CreatePlane(
    'healthBarFg',
    { width: 2.9 * s, height: 0.25 * s },
    scene
  );
  healthBarFg.position.y = 5.5 * s;
  healthBarFg.position.z = -0.01; // Slightly in front
  healthBarFg.billboardMode = Mesh.BILLBOARDMODE_Y;
  const healthBarFgMat = new StandardMaterial('healthFgMat', scene);
  healthBarFgMat.diffuseColor = new Color3(1, 0.2, 0.2);
  healthBarFgMat.emissiveColor = new Color3(0.5, 0.1, 0.1);
  healthBarFg.material = healthBarFgMat;
  healthBarFg.parent = root;

  // Store original health bar width for scaling
  const healthBarFullWidth = 2.9 * s;

  // ==================== ANIMATIONS ====================

  // Slam attack animation
  const slamAnimGroup = new AnimationGroup('slamAttack', scene);

  // Left arm slam
  const leftArmSlamAnim = new Animation(
    'leftArmSlam',
    'rotation.x',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  leftArmSlamAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 10, value: -Math.PI / 3 }, // Wind up
    { frame: 15, value: Math.PI / 4 }, // Slam down
    { frame: 25, value: 0 }, // Return
  ]);

  // Right arm slam (offset timing)
  const rightArmSlamAnim = new Animation(
    'rightArmSlam',
    'rotation.x',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  rightArmSlamAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 5, value: 0 },
    { frame: 15, value: -Math.PI / 3 },
    { frame: 20, value: Math.PI / 4 },
    { frame: 30, value: 0 },
  ]);

  slamAnimGroup.addTargetedAnimation(leftArmSlamAnim, leftArmPivot);
  slamAnimGroup.addTargetedAnimation(rightArmSlamAnim, rightArmPivot);

  // Barrage windup animation
  const barrageAnimGroup = new AnimationGroup('barrageWindup', scene);

  const torsoBarrageAnim = new Animation(
    'torsoBarrage',
    'scaling.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  torsoBarrageAnim.setKeys([
    { frame: 0, value: 1 },
    { frame: 15, value: 1.1 }, // Puff up
    { frame: 45, value: 1.1 }, // Hold
    { frame: 60, value: 1 }, // Release
  ]);

  const leftArmBarrageAnim = new Animation(
    'leftArmBarrage',
    'rotation.z',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  leftArmBarrageAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 15, value: -Math.PI / 4 },
    { frame: 45, value: -Math.PI / 4 },
    { frame: 60, value: 0 },
  ]);

  const rightArmBarrageAnim = new Animation(
    'rightArmBarrage',
    'rotation.z',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  rightArmBarrageAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 15, value: Math.PI / 4 },
    { frame: 45, value: Math.PI / 4 },
    { frame: 60, value: 0 },
  ]);

  barrageAnimGroup.addTargetedAnimation(torsoBarrageAnim, torso);
  barrageAnimGroup.addTargetedAnimation(leftArmBarrageAnim, leftArmPivot);
  barrageAnimGroup.addTargetedAnimation(rightArmBarrageAnim, rightArmPivot);

  // Track rage mode state
  let isRageMode = false;
  let ragePulseTime = 0;

  // Rage mode pulse effect (run in render loop if enabled)
  const ragePulseObserver = scene.onBeforeRenderObservable.add(() => {
    if (isRageMode) {
      ragePulseTime += scene.getEngine().getDeltaTime() / 1000;
      const pulse = 0.2 + Math.sin(ragePulseTime * 8) * 0.1;
      bodyMaterial.emissiveColor = new Color3(pulse, 0, 0);
      eyeMaterial.emissiveColor = new Color3(1, pulse, 0);
    }
  });

  // ==================== PUBLIC API ====================

  const setPosition = (pos: Vector3) => {
    root.position.copyFrom(pos);
  };

  const setRotation = (angle: number) => {
    root.rotation.y = angle;
  };

  const playAttackAnimation = () => {
    slamAnimGroup.stop();
    slamAnimGroup.start(false);
  };

  const playBarrageAnimation = () => {
    barrageAnimGroup.stop();
    barrageAnimGroup.start(false);
  };

  let damageFlashTimeout: Nullable<ReturnType<typeof setTimeout>> = null;
  const originalBodyEmissive = cfg.bodyColor.scale(0.2);

  const playDamageFlash = () => {
    bodyMaterial.emissiveColor = new Color3(1, 1, 1);

    if (damageFlashTimeout) {
      clearTimeout(damageFlashTimeout);
    }

    damageFlashTimeout = setTimeout(() => {
      if (!isRageMode) {
        bodyMaterial.emissiveColor = originalBodyEmissive;
      }
    }, 100);
  };

  const setHealthPercent = (percent: number) => {
    const clampedPercent = Math.max(0, Math.min(1, percent));
    healthBarFg.scaling.x = clampedPercent;
    // Shift position to keep left-aligned
    healthBarFg.position.x = -(healthBarFullWidth / 2) * (1 - clampedPercent);

    // Change color based on health
    if (clampedPercent > 0.5) {
      (healthBarFg.material as StandardMaterial).diffuseColor = new Color3(
        1 - (clampedPercent - 0.5) * 2,
        clampedPercent,
        0.2
      );
    } else {
      (healthBarFg.material as StandardMaterial).diffuseColor = new Color3(
        1,
        clampedPercent * 2,
        0.2
      );
    }
  };

  const setRageMode = (enabled: boolean) => {
    isRageMode = enabled;
    if (!enabled) {
      bodyMaterial.emissiveColor = originalBodyEmissive;
      eyeMaterial.emissiveColor = cfg.eyeColor;
      ragePulseTime = 0;
    }
  };

  const dispose = () => {
    if (damageFlashTimeout) {
      clearTimeout(damageFlashTimeout);
    }

    scene.onBeforeRenderObservable.remove(ragePulseObserver);

    slamAnimGroup.dispose();
    barrageAnimGroup.dispose();

    // Dispose all meshes
    torso.dispose();
    head.dispose();
    leftHorn.dispose();
    rightHorn.dispose();
    leftEye.dispose();
    rightEye.dispose();
    leftArm.dispose();
    leftClaw.dispose();
    rightArm.dispose();
    rightClaw.dispose();
    leftLeg.dispose();
    rightLeg.dispose();
    healthBarBg.dispose();
    healthBarFg.dispose();

    // Dispose transform nodes
    leftArmPivot.dispose();
    rightArmPivot.dispose();
    root.dispose();

    // Dispose materials
    bodyMaterial.dispose();
    accentMaterial.dispose();
    metalMaterial.dispose();
    eyeMaterial.dispose();
    healthBarBgMat.dispose();
    healthBarFgMat.dispose();
  };

  return {
    root,
    mesh: torso, // Return torso as main mesh reference
    setPosition,
    setRotation,
    playAttackAnimation,
    playBarrageAnimation,
    playDamageFlash,
    setHealthPercent,
    setRageMode,
    dispose,
  };
}
