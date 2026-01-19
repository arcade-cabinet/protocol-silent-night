/**
 * GameScene - BabylonJS React Native game scene
 *
 * Full integration of all BabylonJS systems:
 * - GLB character loading (Meshy-generated) with procedural fallback
 * - PBR textured terrain and obstacles
 * - Enemy management (InstancedMinions, BossMesh)
 * - Bullet system
 * - Isometric camera
 * - DDL-driven lighting
 * - Touch input controls
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import { Scene, Vector3, type Camera } from '@babylonjs/core';

// Game systems
import { createIsometricCamera, applyCameraShake } from '../src/camera';
import { createLightingSystem } from '../src/lighting';
import { createTerrain } from '../src/terrain/ProceduralTerrain';
import { createObstacleSystem } from '../src/obstacles/ObstacleRenderer';
import { createAnimeHero } from '../src/characters/AnimeHero';
import { createEnemyManager } from '../src/enemies';
import { createBulletManager } from '../src/bullets';
import { VirtualJoystick } from '../src/input/VirtualJoystick';
import { GestureHandler } from '../src/input/GestureHandler';

// GLB and texture loaders
import {
  loadGLBCharacter,
  GLBCharacterController,
  createCyberpunkGroundMaterial,
} from '../src/loaders';

// DDL loaders
import {
  loadClasses,
  loadThemes,
  loadTerrainConfig,
  loadEnemies,
  loadWeapons,
} from '@protocol-silent-night/game-core';

// Store
import { useGameStore } from '@protocol-silent-night/game-core';

// Debug API (development only)
import { initDebugAPI, cleanupDebugAPI, updateDebugFPS } from '../src/debug';

interface GameSceneProps {
  classType: 'santa' | 'elf' | 'bumble';
  onReady?: () => void;
  onGameOver?: () => void;
  onWin?: () => void;
}

export function GameScene({
  classType,
  onReady,
  onGameOver,
  onWin,
}: GameSceneProps) {
  const engine = useEngine();
  const [camera, setCamera] = useState<Camera | undefined>();

  // Game store state (reactive subscriptions for UI)
  const { gameState, player, screenShake, setMovement, setFiring } = useGameStore();

  // Refs for game systems
  const sceneRef = useRef<Scene | null>(null);
  const playerRef = useRef<ReturnType<typeof createAnimeHero> | GLBCharacterController | null>(null);
  const enemyManagerRef = useRef<ReturnType<typeof createEnemyManager> | null>(null);
  const bulletManagerRef = useRef<ReturnType<typeof createBulletManager> | null>(null);
  const cameraSystemRef = useRef<ReturnType<typeof createIsometricCamera> | null>(null);
  const useGLBRef = useRef<boolean>(false);

  // Combat timing refs (prevent per-frame damage/firing)
  const lastDamageTimeRef = useRef<number>(0);
  const lastFireTimeRef = useRef<number>(0);
  const playerFacingRef = useRef<Vector3>(new Vector3(0, 0, 1));

  // Damage cooldown in seconds
  const DAMAGE_COOLDOWN = 0.5;
  // Fire rate will be loaded from weapon config

  // Handle game state changes
  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      onGameOver?.();
    } else if (gameState === 'WIN') {
      onWin?.();
    }
  }, [gameState, onGameOver, onWin]);

  // Handle screen shake
  useEffect(() => {
    if (screenShake > 0 && cameraSystemRef.current) {
      applyCameraShake(cameraSystemRef.current.camera, screenShake, 0.3);
    }
  }, [screenShake]);

  // Main scene setup
  useEffect(() => {
    if (!engine) return;

    let disposed = false;

    const initializeScene = async () => {
    // Load DDL configs
    const classes = loadClasses();
    const themes = loadThemes();
    const terrainConfig = loadTerrainConfig();
    const enemyData = loadEnemies();
    const weapons = loadWeapons();

    const classConfig = classes[classType];
    if (!classConfig) {
      console.error(`Class type '${classType}' not found`);
      return;
    }

    const theme = themes.default ?? themes;

    // Create scene
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // 1. Setup lighting from DDL
    const _lighting = createLightingSystem({ scene, theme });

    // 2. Create terrain with PBR material
    const terrain = createTerrain(scene, terrainConfig);
    // Apply PBR ground material
    try {
      const groundMaterial = createCyberpunkGroundMaterial(scene);
      terrain.mesh.material = groundMaterial;
    } catch {
      console.log('PBR textures not available, using procedural material');
    }

    // 3. Create obstacles
    const _obstacles = createObstacleSystem(scene, []);

    // 4. Create player character - try GLB first, fallback to procedural
    let playerCharacter: ReturnType<typeof createAnimeHero> | GLBCharacterController;

    // Map class type to character ID
    const characterIdMap: Record<string, string> = {
      santa: 'santa',
      elf: 'cyberelf',
      bumble: 'bumble',
    };
    const characterId = characterIdMap[classType] ?? classType;

    // Try to load GLB character
    const glbCharacter = await loadGLBCharacter(scene, characterId, Vector3.Zero());

    if (glbCharacter) {
      console.log(`✓ Loaded GLB character: ${characterId}`);
      playerCharacter = new GLBCharacterController(glbCharacter);
      useGLBRef.current = true;
    } else {
      console.log(`⚠ GLB not found for ${characterId}, using procedural generation`);
      playerCharacter = createAnimeHero({
        scene,
        config: classConfig,
        position: { x: 0, y: 0, z: 0 },
      });
      useGLBRef.current = false;
    }

    playerRef.current = playerCharacter;

    // 5. Setup isometric camera
    const cameraSystem = createIsometricCamera(scene);
    setCamera(cameraSystem.camera);
    cameraSystemRef.current = cameraSystem;

    // 6. Initialize enemy manager with type assertion for literal types
    const enemyConfig = {
      minion: { ...enemyData.minion, type: 'minion' as const },
      boss: { ...enemyData.boss, type: 'boss' as const },
      spawnConfig: enemyData.spawnConfig,
    };
    const enemies = createEnemyManager(scene, enemyConfig);
    enemyManagerRef.current = enemies;

    // 7. Initialize bullet manager
    const bullets = createBulletManager(scene);
    bulletManagerRef.current = bullets;

    // 8. Initialize debug API (development only)
    initDebugAPI({
      scene,
      player: playerCharacter,
      enemies,
      bullets,
      camera: cameraSystem,
    });

    // 9. Game loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsUpdateTime = 0;

    scene.onBeforeRenderObservable.add(() => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Update debug FPS counter
      frameCount++;
      fpsUpdateTime += deltaTime;
      if (fpsUpdateTime >= 1.0) {
        updateDebugFPS(Math.round(frameCount / fpsUpdateTime));
        frameCount = 0;
        fpsUpdateTime = 0;
      }

      const currentPhase = useGameStore.getState().phase;
      if (currentPhase !== 'PHASE_1' && currentPhase !== 'PHASE_BOSS') return;

      // Get current player position from store
      const playerPos = useGameStore.getState().player.position;
      const currentInput = useGameStore.getState().input;

      // Update player movement from input
      const moveSpeed = classConfig.speed * deltaTime;
      const moveX = currentInput.movement.x * moveSpeed;
      const moveZ = currentInput.movement.y * moveSpeed;

      if (moveX !== 0 || moveZ !== 0) {
        const newX = playerPos.x + moveX;
        const newZ = playerPos.z + moveZ;
        useGameStore.getState().updatePlayerPosition(newX, 0, newZ);
        playerCharacter.update(deltaTime, true, currentInput.isFiring);
        cameraSystem.followTarget(new Vector3(newX, 0, newZ));
        // Update player facing direction based on movement
        playerFacingRef.current = new Vector3(moveX, 0, moveZ).normalize();
      } else {
        playerCharacter.update(deltaTime, false, currentInput.isFiring);
      }

      // Update enemies
      enemies.update(deltaTime, new Vector3(playerPos.x, 0, playerPos.z));

      // Update bullets
      bullets.update(deltaTime);

      // Check bullet-enemy collisions
      const collisions = bullets.checkCollisions(
        enemies.getEnemies().map((e) => ({
          id: e.id,
          position: new Vector3(e.position.x, e.position.y, e.position.z),
          radius: 1.5,
        }))
      );

      // Process collisions
      for (const collision of collisions) {
        const killed = enemies.damage(collision.enemyId, classConfig.damage);
        if (killed) {
          const enemy = enemies.getEnemies().find((e) => e.id === collision.enemyId);
          if (enemy) {
            useGameStore.getState().addKill(enemy.type === 'boss' ? 500 : 100);
          }
        }
      }

      // Check enemy-player collisions (with damage cooldown)
      const currentTime = now / 1000; // Convert to seconds
      for (const enemy of enemies.getEnemies()) {
        const dist = Math.sqrt(
          (enemy.position.x - playerPos.x) ** 2 +
          (enemy.position.z - playerPos.z) ** 2
        );
        if (dist < 2 && currentTime - lastDamageTimeRef.current >= DAMAGE_COOLDOWN) {
          useGameStore.getState().damagePlayer(enemy.type === 'boss' ? 20 : 5);
          lastDamageTimeRef.current = currentTime;
          break; // Only take damage from one enemy per cooldown
        }
      }

      // Fire bullets (with rate limiting)
      if (currentInput.isFiring) {
        // Get fire rate from weapon config (default 0.15s = ~6.6 shots/sec)
        const weaponConfig = weapons[classConfig.weaponType as keyof typeof weapons];
        const fireRate = weaponConfig?.fireRate ?? 0.15;

        if (currentTime - lastFireTimeRef.current >= fireRate) {
          // Use player facing direction (normalized)
          const direction = playerFacingRef.current.length() > 0
            ? playerFacingRef.current.clone().normalize()
            : new Vector3(0, 0, 1); // Default forward if no movement yet

          bullets.fire(
            classConfig.weaponType,
            new Vector3(playerPos.x, 1, playerPos.z),
            direction,
            classConfig.damage
          );
          lastFireTimeRef.current = currentTime;
        }
      }
    });

    if (!disposed) {
      onReady?.();
    }
    };

    // Run async initialization
    initializeScene().catch(console.error);

    // Cleanup
    return () => {
      disposed = true;
      cleanupDebugAPI();
      playerRef.current?.dispose();
      enemyManagerRef.current?.dispose();
      bulletManagerRef.current?.dispose();
      cameraSystemRef.current?.dispose();
      sceneRef.current?.dispose();
    };
  // Note: Store actions accessed via useGameStore.getState() inside callbacks
  // to avoid re-running effect when they change (they're stable but React doesn't know)
  }, [engine, classType, onReady]);

  // Handle joystick input
  const handleJoystickMove = useCallback(
    (x: number, y: number) => {
      setMovement(x, y);
    },
    [setMovement]
  );

  const handleJoystickRelease = useCallback(() => {
    setMovement(0, 0);
  }, [setMovement]);

  // Handle tap to fire
  const handleTap = useCallback(() => {
    setFiring(true);
    setTimeout(() => setFiring(false), 100);
  }, [setFiring]);

  // Handle pinch to zoom
  const handlePinch = useCallback(
    (scale: number) => {
      if (cameraSystemRef.current) {
        cameraSystemRef.current.setZoom(scale);
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <GestureHandler onPinch={handlePinch} onTap={handleTap}>
        {/* @ts-expect-error React 19 type compatibility with @babylonjs/react-native */}
        <EngineView style={styles.engineView} camera={camera} />
      </GestureHandler>

      {/* HUD Overlay */}
      <View style={styles.hudOverlay}>
        <View style={styles.healthBar}>
          <View
            style={[
              styles.healthFill,
              { width: `${(player.hp / player.maxHp) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Virtual Joystick */}
      <View style={styles.joystickContainer}>
        <VirtualJoystick
          onMove={handleJoystickMove}
          onRelease={handleJoystickRelease}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  engineView: {
    flex: 1,
  },
  hudOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  healthBar: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ff66',
  },
  healthFill: {
    height: '100%',
    backgroundColor: '#00ff66',
  },
  joystickContainer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 150,
    height: 150,
  },
});
