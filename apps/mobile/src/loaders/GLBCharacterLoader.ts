/**
 * GLB Character Loader
 *
 * Loads pre-generated Meshy GLB characters with animations.
 * Falls back to procedural generation if GLB not available.
 */

import {
  Scene,
  SceneLoader,
  AbstractMesh,
  AnimationGroup,
  Skeleton,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// ============================================================================
// TYPES
// ============================================================================

export interface LoadedCharacter {
  root: TransformNode;
  meshes: AbstractMesh[];
  skeleton: Skeleton | null;
  animations: Map<string, AnimationGroup>;
  dispose: () => void;
}

export interface CharacterAnimations {
  idle?: AnimationGroup;
  walk?: AnimationGroup;
  run?: AnimationGroup;
  attack?: AnimationGroup;
  hit?: AnimationGroup;
  death?: AnimationGroup;
}

// Animation name mapping from Meshy to game actions
const ANIMATION_MAPPING: Record<string, string> = {
  'combat_stance': 'idle',
  'runfast': 'run',
  'kung_fu_punch': 'attack',
  'behit_flyup': 'hit',
  'dead': 'death',
  'basic_jump': 'jump',
  'dodge_and_counter': 'dodge',
  'double_combo_attack': 'attack',
  'block1': 'block',
};

// ============================================================================
// LOADER
// ============================================================================

/**
 * Load a GLB character from the assets directory
 */
export async function loadGLBCharacter(
  scene: Scene,
  characterId: string,
  position: Vector3 = Vector3.Zero()
): Promise<LoadedCharacter | null> {
  // Try to load the base rigged model first
  const basePath = `../../assets/characters/${characterId}/`;

  try {
    // Load the main character GLB (rigged model)
    const result = await SceneLoader.ImportMeshAsync(
      '',
      basePath,
      'model.glb',
      scene
    );

    if (!result.meshes.length) {
      console.warn(`No meshes found in GLB for ${characterId}`);
      return null;
    }

    // Create root transform node
    const root = new TransformNode(`${characterId}_root`, scene);
    root.position = position;

    // Parent all meshes to root
    for (const mesh of result.meshes) {
      if (!mesh.parent) {
        mesh.parent = root;
      }
    }

    // Collect animations
    const animations = new Map<string, AnimationGroup>();

    // Load animation GLBs from the animations directory
    const animationNames = [
      'combat_stance',
      'runfast',
      'kung_fu_punch',
      'behit_flyup',
      'dead',
      'basic_jump',
      'dodge_and_counter',
    ];

    for (const animName of animationNames) {
      try {
        const animResult = await SceneLoader.ImportMeshAsync(
          '',
          `${basePath}animations/`,
          `${animName.toLowerCase()}.glb`,
          scene
        );

        // Get animation groups from the loaded file
        for (const animGroup of animResult.animationGroups) {
          const mappedName = ANIMATION_MAPPING[animName.toLowerCase()] ?? animName;
          animations.set(mappedName, animGroup);
          animGroup.stop(); // Don't auto-play
        }

        // Dispose the extra meshes (we only need the animations)
        for (const mesh of animResult.meshes) {
          if (mesh !== result.meshes[0]) {
            mesh.dispose();
          }
        }
      } catch {
        // Animation file not found, skip
        console.log(`Animation ${animName} not found for ${characterId}`);
      }
    }

    // Also check for animations in the main GLB
    for (const animGroup of result.animationGroups) {
      const name = animGroup.name.toLowerCase();
      const mappedName = ANIMATION_MAPPING[name] ?? name;
      if (!animations.has(mappedName)) {
        animations.set(mappedName, animGroup);
      }
      animGroup.stop();
    }

    return {
      root,
      meshes: result.meshes,
      skeleton: result.skeletons[0] ?? null,
      animations,
      dispose: () => {
        for (const mesh of result.meshes) {
          mesh.dispose();
        }
        for (const animGroup of animations.values()) {
          animGroup.dispose();
        }
        root.dispose();
      },
    };
  } catch (error) {
    console.warn(`Failed to load GLB for ${characterId}:`, error);
    return null;
  }
}

/**
 * Check if a GLB character exists
 */
export async function hasGLBCharacter(characterId: string): Promise<boolean> {
  // In a real implementation, this would check if the file exists
  // For now, we assume GLBs exist after generation
  const knownCharacters = ['santa', 'cyberelf', 'bumble', 'yuletide', 'minion', 'krampus'];
  return knownCharacters.includes(characterId);
}

/**
 * Character controller that wraps a loaded GLB
 */
export class GLBCharacterController {
  private character: LoadedCharacter;
  private currentAnimation: AnimationGroup | null = null;
  private _isMoving = false;
  private _isFiring = false;

  constructor(character: LoadedCharacter) {
    this.character = character;
  }

  get root(): TransformNode {
    return this.character.root;
  }

  get position(): Vector3 {
    return this.character.root.position;
  }

  set position(value: Vector3) {
    this.character.root.position = value;
  }

  /**
   * Play an animation by name
   */
  playAnimation(name: string, loop = true): void {
    const anim = this.character.animations.get(name);
    if (!anim) return;

    if (this.currentAnimation && this.currentAnimation !== anim) {
      this.currentAnimation.stop();
    }

    this.currentAnimation = anim;
    anim.start(loop);
  }

  /**
   * Stop all animations
   */
  stopAnimations(): void {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }
  }

  /**
   * Update character state based on movement/firing
   */
  update(deltaTime: number, isMoving: boolean, isFiring: boolean): void {
    // Determine which animation to play
    if (isFiring && !this._isFiring) {
      this.playAnimation('attack', false);
    } else if (isMoving && !this._isMoving) {
      this.playAnimation('run', true);
    } else if (!isMoving && this._isMoving) {
      this.playAnimation('idle', true);
    }

    this._isMoving = isMoving;
    this._isFiring = isFiring;

    // Handle attack animation completion
    if (this._isFiring && this.currentAnimation) {
      const anim = this.character.animations.get('attack');
      if (anim && !anim.isPlaying) {
        // Attack finished, return to appropriate animation
        this._isFiring = false;
        this.playAnimation(this._isMoving ? 'run' : 'idle', true);
      }
    }
  }

  /**
   * Rotate to face direction
   */
  lookAt(direction: Vector3): void {
    if (direction.lengthSquared() > 0.001) {
      const angle = Math.atan2(direction.x, direction.z);
      this.character.root.rotation.y = angle;
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.character.dispose();
  }
}
