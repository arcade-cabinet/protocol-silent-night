/**
 * @fileoverview Character animation utilities for BabylonJS
 * @module characters/CharacterAnimations
 *
 * Provides procedural animations for walk, idle, and fire states.
 * Uses BabylonJS Animation class for smooth interpolation.
 */

import {
  Scene,
  Animation,
  AnimationGroup,
  Vector3,
  Quaternion,
  TransformNode,
  EasingFunction,
  SineEase,
  BezierCurveEase,
} from '@babylonjs/core';
import type { JointName, AnimationState } from './CharacterTypes';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Frames per second */
  fps: number;
  /** Duration in seconds */
  duration: number;
  /** Whether animation loops */
  loop: boolean;
  /** Speed multiplier */
  speedRatio: number;
}

/**
 * Default animation configs
 */
export const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  idle: {
    fps: 30,
    duration: 2.0,
    loop: true,
    speedRatio: 1.0,
  },
  walk: {
    fps: 30,
    duration: 0.8,
    loop: true,
    speedRatio: 1.0,
  },
  fire: {
    fps: 30,
    duration: 0.2,
    loop: false,
    speedRatio: 1.0,
  },
};

/**
 * Joint rotation keyframes
 */
interface JointKeyframe {
  frame: number;
  rotation: Vector3;
}

/**
 * Animation keyframe data for all joints
 */
type AnimationKeyframes = Partial<Record<JointName, JointKeyframe[]>>;

/**
 * Idle animation keyframes - subtle breathing/sway motion
 */
const IDLE_KEYFRAMES: AnimationKeyframes = {
  torso: [
    { frame: 0, rotation: new Vector3(0, 0, 0) },
    { frame: 30, rotation: new Vector3(0.02, 0, 0.01) },
    { frame: 60, rotation: new Vector3(0, 0, 0) },
  ],
  head: [
    { frame: 0, rotation: new Vector3(0, 0, 0) },
    { frame: 20, rotation: new Vector3(0, 0.05, 0) },
    { frame: 40, rotation: new Vector3(0, -0.03, 0) },
    { frame: 60, rotation: new Vector3(0, 0, 0) },
  ],
  armL: [
    { frame: 0, rotation: new Vector3(0, 0, 0.1) },
    { frame: 30, rotation: new Vector3(0.03, 0, 0.12) },
    { frame: 60, rotation: new Vector3(0, 0, 0.1) },
  ],
  armR: [
    { frame: 0, rotation: new Vector3(0, 0, -0.1) },
    { frame: 30, rotation: new Vector3(0.03, 0, -0.12) },
    { frame: 60, rotation: new Vector3(0, 0, -0.1) },
  ],
};

/**
 * Walk animation keyframes - alternating step cycle
 */
const WALK_KEYFRAMES: AnimationKeyframes = {
  hips: [
    { frame: 0, rotation: new Vector3(0, 0, 0.02) },
    { frame: 6, rotation: new Vector3(0, 0, 0) },
    { frame: 12, rotation: new Vector3(0, 0, -0.02) },
    { frame: 18, rotation: new Vector3(0, 0, 0) },
    { frame: 24, rotation: new Vector3(0, 0, 0.02) },
  ],
  torso: [
    { frame: 0, rotation: new Vector3(0.05, 0.03, 0) },
    { frame: 12, rotation: new Vector3(0.05, -0.03, 0) },
    { frame: 24, rotation: new Vector3(0.05, 0.03, 0) },
  ],
  head: [
    { frame: 0, rotation: new Vector3(-0.05, -0.02, 0) },
    { frame: 12, rotation: new Vector3(-0.05, 0.02, 0) },
    { frame: 24, rotation: new Vector3(-0.05, -0.02, 0) },
  ],
  armL: [
    { frame: 0, rotation: new Vector3(-0.4, 0, 0.15) },
    { frame: 12, rotation: new Vector3(0.4, 0, 0.15) },
    { frame: 24, rotation: new Vector3(-0.4, 0, 0.15) },
  ],
  armR: [
    { frame: 0, rotation: new Vector3(0.4, 0, -0.15) },
    { frame: 12, rotation: new Vector3(-0.4, 0, -0.15) },
    { frame: 24, rotation: new Vector3(0.4, 0, -0.15) },
  ],
  legL: [
    { frame: 0, rotation: new Vector3(0.35, 0, 0) },
    { frame: 6, rotation: new Vector3(0, 0, 0) },
    { frame: 12, rotation: new Vector3(-0.35, 0, 0) },
    { frame: 18, rotation: new Vector3(0, 0, 0) },
    { frame: 24, rotation: new Vector3(0.35, 0, 0) },
  ],
  legR: [
    { frame: 0, rotation: new Vector3(-0.35, 0, 0) },
    { frame: 6, rotation: new Vector3(0, 0, 0) },
    { frame: 12, rotation: new Vector3(0.35, 0, 0) },
    { frame: 18, rotation: new Vector3(0, 0, 0) },
    { frame: 24, rotation: new Vector3(-0.35, 0, 0) },
  ],
};

/**
 * Fire animation keyframes - recoil motion
 */
const FIRE_KEYFRAMES: AnimationKeyframes = {
  torso: [
    { frame: 0, rotation: new Vector3(0, 0, 0) },
    { frame: 2, rotation: new Vector3(-0.08, 0, 0) },
    { frame: 6, rotation: new Vector3(0, 0, 0) },
  ],
  armR: [
    { frame: 0, rotation: new Vector3(0, 0, -0.1) },
    { frame: 2, rotation: new Vector3(-0.2, 0.1, -0.15) },
    { frame: 6, rotation: new Vector3(0, 0, -0.1) },
  ],
  head: [
    { frame: 0, rotation: new Vector3(0, 0, 0) },
    { frame: 2, rotation: new Vector3(-0.03, 0, 0) },
    { frame: 6, rotation: new Vector3(0, 0, 0) },
  ],
};

/**
 * Creates a rotation animation for a joint
 */
function createJointAnimation(
  name: string,
  keyframes: JointKeyframe[],
  fps: number
): Animation {
  const animation = new Animation(
    name,
    'rotationQuaternion',
    fps,
    Animation.ANIMATIONTYPE_QUATERNION,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // Convert euler keyframes to quaternion keys
  const keys = keyframes.map((kf) => ({
    frame: kf.frame,
    value: Quaternion.FromEulerAngles(
      kf.rotation.x,
      kf.rotation.y,
      kf.rotation.z
    ),
  }));

  animation.setKeys(keys);

  // Add easing
  const ease = new SineEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  animation.setEasingFunction(ease);

  return animation;
}

/**
 * Creates an animation group from keyframe data
 */
function createAnimationGroup(
  scene: Scene,
  name: string,
  keyframes: AnimationKeyframes,
  joints: Map<JointName, TransformNode>,
  config: AnimationConfig
): AnimationGroup {
  const group = new AnimationGroup(name, scene);

  for (const [jointName, jointKeyframes] of Object.entries(keyframes)) {
    const joint = joints.get(jointName as JointName);
    if (!joint || !jointKeyframes) continue;

    // Ensure joint has rotation quaternion
    if (!joint.rotationQuaternion) {
      joint.rotationQuaternion = Quaternion.Identity();
    }

    const animation = createJointAnimation(
      `${name}_${jointName}`,
      jointKeyframes,
      config.fps
    );

    group.addTargetedAnimation(animation, joint);
  }

  return group;
}

/**
 * Animation controller for a character
 */
export interface AnimationController {
  /** Current animation state */
  state: AnimationState;
  /** Idle animation group */
  idleAnimation: AnimationGroup;
  /** Walk animation group */
  walkAnimation: AnimationGroup;
  /** Fire animation group */
  fireAnimation: AnimationGroup;
  /** Play specific animation */
  play: (animName: 'idle' | 'walk' | 'fire') => void;
  /** Stop all animations */
  stop: () => void;
  /** Update controller (call each frame) */
  update: (deltaTime: number, isMoving: boolean, isFiring: boolean) => void;
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Creates an animation controller for a character
 *
 * @param scene - BabylonJS scene
 * @param joints - Map of joint transform nodes
 * @param speedMultiplier - Speed modifier based on character class
 * @returns Animation controller
 */
export function createAnimationController(
  scene: Scene,
  joints: Map<JointName, TransformNode>,
  speedMultiplier: number = 1.0
): AnimationController {
  // Initialize joint quaternions
  for (const joint of joints.values()) {
    if (!joint.rotationQuaternion) {
      joint.rotationQuaternion = Quaternion.Identity();
    }
  }

  // Create animation groups
  const idleAnimation = createAnimationGroup(
    scene,
    'idle',
    IDLE_KEYFRAMES,
    joints,
    ANIMATION_CONFIGS.idle
  );

  const walkAnimation = createAnimationGroup(
    scene,
    'walk',
    WALK_KEYFRAMES,
    joints,
    ANIMATION_CONFIGS.walk
  );

  const fireAnimation = createAnimationGroup(
    scene,
    'fire',
    FIRE_KEYFRAMES,
    joints,
    ANIMATION_CONFIGS.fire
  );

  // Set looping
  idleAnimation.loopAnimation = true;
  walkAnimation.loopAnimation = true;
  fireAnimation.loopAnimation = false;

  // Apply speed multiplier to walk
  walkAnimation.speedRatio = speedMultiplier;

  // Animation state
  const state: AnimationState = {
    current: 'idle',
    progress: 0,
    blendWeight: 1,
    previous: null,
  };

  let fireTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Plays a specific animation
   */
  const play = (animName: 'idle' | 'walk' | 'fire'): void => {
    if (state.current === animName && animName !== 'fire') return;

    // Stop current animation
    stop();

    state.previous = state.current;
    state.current = animName;
    state.progress = 0;
    state.blendWeight = 1;

    switch (animName) {
      case 'idle':
        idleAnimation.play(true);
        break;
      case 'walk':
        walkAnimation.play(true);
        break;
      case 'fire':
        fireAnimation.play(false);
        // Return to previous state after fire animation
        fireTimeout = setTimeout(() => {
          if (state.current === 'fire') {
            play(state.previous === 'walk' ? 'walk' : 'idle');
          }
        }, ANIMATION_CONFIGS.fire.duration * 1000);
        break;
    }
  };

  /**
   * Stops all animations
   */
  const stop = (): void => {
    idleAnimation.stop();
    walkAnimation.stop();
    fireAnimation.stop();
    if (fireTimeout) {
      clearTimeout(fireTimeout);
      fireTimeout = null;
    }
  };

  /**
   * Updates animation state based on character state
   */
  const update = (
    _deltaTime: number,
    isMoving: boolean,
    isFiring: boolean
  ): void => {
    // Handle firing (takes priority)
    if (isFiring && state.current !== 'fire') {
      play('fire');
      return;
    }

    // Don't interrupt fire animation
    if (state.current === 'fire') {
      return;
    }

    // Switch between idle and walk
    if (isMoving && state.current !== 'walk') {
      play('walk');
    } else if (!isMoving && state.current !== 'idle') {
      play('idle');
    }
  };

  /**
   * Disposes all animation resources
   */
  const dispose = (): void => {
    stop();
    idleAnimation.dispose();
    walkAnimation.dispose();
    fireAnimation.dispose();
  };

  // Start with idle
  play('idle');

  return {
    state,
    idleAnimation,
    walkAnimation,
    fireAnimation,
    play,
    stop,
    update,
    dispose,
  };
}

/**
 * Creates a simple bobbing animation for floating characters/effects
 *
 * @param scene - BabylonJS scene
 * @param target - Target transform node
 * @param amplitude - Bob amplitude
 * @param speed - Bob speed
 * @returns Animation object
 */
export function createBobAnimation(
  scene: Scene,
  target: TransformNode,
  amplitude: number = 0.1,
  speed: number = 1.0
): Animation {
  const animation = new Animation(
    'bob',
    'position.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const baseY = target.position.y;
  const frames = 60 / speed;

  animation.setKeys([
    { frame: 0, value: baseY },
    { frame: frames / 2, value: baseY + amplitude },
    { frame: frames, value: baseY },
  ]);

  const ease = new SineEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  animation.setEasingFunction(ease);

  return animation;
}

/**
 * Creates a procedural walk cycle without pre-defined keyframes
 * More flexible for runtime speed adjustments
 *
 * @param joints - Joint transform nodes
 * @param time - Current time in seconds
 * @param speed - Walk speed (cycles per second)
 * @param intensity - Animation intensity multiplier
 */
export function applyProceduralWalkCycle(
  joints: Map<JointName, TransformNode>,
  time: number,
  speed: number = 1.0,
  intensity: number = 1.0
): void {
  const t = time * speed * Math.PI * 2;

  // Hips sway
  const hips = joints.get('hips');
  if (hips) {
    hips.rotationQuaternion = Quaternion.FromEulerAngles(
      0,
      0,
      Math.sin(t) * 0.02 * intensity
    );
  }

  // Torso lean
  const torso = joints.get('torso');
  if (torso) {
    torso.rotationQuaternion = Quaternion.FromEulerAngles(
      0.05 * intensity,
      Math.sin(t) * 0.03 * intensity,
      0
    );
  }

  // Head counterbalance
  const head = joints.get('head');
  if (head) {
    head.rotationQuaternion = Quaternion.FromEulerAngles(
      -0.05 * intensity,
      Math.sin(t) * -0.02 * intensity,
      0
    );
  }

  // Arms swing opposite to legs
  const armL = joints.get('armL');
  if (armL) {
    armL.rotationQuaternion = Quaternion.FromEulerAngles(
      Math.sin(t + Math.PI) * 0.4 * intensity,
      0,
      0.15
    );
  }

  const armR = joints.get('armR');
  if (armR) {
    armR.rotationQuaternion = Quaternion.FromEulerAngles(
      Math.sin(t) * 0.4 * intensity,
      0,
      -0.15
    );
  }

  // Legs stride
  const legL = joints.get('legL');
  if (legL) {
    legL.rotationQuaternion = Quaternion.FromEulerAngles(
      Math.sin(t) * 0.35 * intensity,
      0,
      0
    );
  }

  const legR = joints.get('legR');
  if (legR) {
    legR.rotationQuaternion = Quaternion.FromEulerAngles(
      Math.sin(t + Math.PI) * 0.35 * intensity,
      0,
      0
    );
  }
}

/**
 * Creates weapon recoil animation
 *
 * @param weaponNode - Weapon transform node
 * @param scene - BabylonJS scene
 * @param recoilAmount - Recoil distance
 * @param duration - Recovery duration in seconds
 */
export function playWeaponRecoil(
  weaponNode: TransformNode,
  scene: Scene,
  recoilAmount: number = 0.1,
  duration: number = 0.15
): void {
  const animation = new Animation(
    'recoil',
    'position.z',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const baseZ = weaponNode.position.z;
  const frames = duration * 30;

  animation.setKeys([
    { frame: 0, value: baseZ },
    { frame: 2, value: baseZ - recoilAmount },
    { frame: frames, value: baseZ },
  ]);

  const ease = new BezierCurveEase(0.17, 0.67, 0.83, 0.67);
  animation.setEasingFunction(ease);

  scene.beginDirectAnimation(
    weaponNode,
    [animation],
    0,
    frames,
    false
  );
}
