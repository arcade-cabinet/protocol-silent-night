/**
 * Protocol: Silent Night - Mobile App
 * BabylonJS React Native + Expo
 * Full game implementation with touch controls
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import {
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  PointLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  type Mesh,
  GlowLayer,
} from '@babylonjs/core';
import { useGameStore, CLASSES, ENEMIES, WEAPONS, TERRAIN } from '@protocol-silent-night/game-core';
import type { ClassType, Enemy, Bullet } from '@protocol-silent-night/game-core';
import { VirtualJoystick } from '../src/input/VirtualJoystick';
import { GestureHandler, useFireControl } from '../src/input/GestureHandler';

// Game constants from DDL
const ENEMY_CONFIG = ENEMIES.minion;
const SPAWN_CONFIG = ENEMIES.spawnConfig;
const BOSS_CONFIG = ENEMIES.boss;
const KILLS_FOR_BOSS = 50;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const state = useGameStore((s) => s.state);

  return (
    <View style={styles.container}>
      {state === 'MENU' && <MenuScreen />}
      {state === 'BRIEFING' && <BriefingScreen />}
      {(state === 'PHASE_1' || state === 'BOSS_FIGHT') && <GameScreen />}
      {state === 'GAME_OVER' && <GameOverScreen />}
      {state === 'VICTORY' && <VictoryScreen />}
    </View>
  );
}

function MenuScreen() {
  const selectClass = useGameStore((s) => s.selectClass);
  const setState = useGameStore((s) => s.setState);
  const selectedClass = useGameStore((s) => s.selectedClass);

  const classTypes = Object.keys(CLASSES) as ClassType[];

  return (
    <View style={styles.menu}>
      <Text style={styles.title}>PROTOCOL:</Text>
      <Text style={styles.titleHighlight}>SILENT NIGHT</Text>
      <Text style={styles.subtitle}>MOBILE EDITION</Text>

      <View style={styles.classGrid}>
        {classTypes.map((classType) => {
          const cls = CLASSES[classType];
          return (
            <TouchableOpacity
              key={classType}
              style={[styles.classCard, selectedClass === classType && styles.classCardSelected]}
              onPress={() => selectClass(classType)}
            >
              <Text style={[styles.className, selectedClass === classType && styles.classNameSelected]}>
                {cls.name}
              </Text>
              <Text style={styles.classRole}>{cls.role}</Text>
              <Text style={styles.classStats}>HP: {cls.hp} | SPD: {cls.speed}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, !selectedClass && styles.buttonDisabled]}
        onPress={() => selectedClass && setState('BRIEFING')}
        disabled={!selectedClass}
      >
        <Text style={styles.buttonText}>START MISSION</Text>
      </TouchableOpacity>
    </View>
  );
}

function BriefingScreen() {
  const setState = useGameStore((s) => s.setState);
  const selectedClass = useGameStore((s) => s.selectedClass);
  const classConfig = selectedClass ? CLASSES[selectedClass] : null;

  return (
    <View style={styles.briefing}>
      <Text style={styles.briefingTitle}>MISSION BRIEFING</Text>

      <View style={styles.briefingContent}>
        <Text style={styles.briefingLabel}>OPERATOR</Text>
        <Text style={styles.briefingValue}>{classConfig?.name}</Text>

        <Text style={styles.briefingLabel}>ROLE</Text>
        <Text style={styles.briefingValue}>{classConfig?.role}</Text>

        <Text style={styles.briefingLabel}>OBJECTIVE</Text>
        <Text style={styles.briefingValue}>Eliminate Grinch-Bot forces</Text>

        <Text style={styles.briefingLabel}>INTEL</Text>
        <Text style={styles.briefingValue}>Defeat {KILLS_FOR_BOSS} minions to draw out the boss</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setState('PHASE_1')}>
        <Text style={styles.buttonText}>COMMENCE OPERATION</Text>
      </TouchableOpacity>
    </View>
  );
}

function GameScreen() {
  const engine = useEngine();
  const sceneRef = useRef<Scene | null>(null);
  const playerRef = useRef<Mesh | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const enemyMeshesRef = useRef<Map<string, Mesh>>(new Map());
  const bulletMeshesRef = useRef<Map<string, Mesh>>(new Map());
  const bossMeshRef = useRef<Mesh | null>(null);

  // Movement state from joystick
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 });

  // Timing refs
  const lastFireTimeRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const lastDamageTimeRef = useRef(0);

  // Get class config
  const selectedClass = useGameStore((s) => s.selectedClass);
  const classConfig = selectedClass ? CLASSES[selectedClass] : null;
  const playerSpeed = classConfig?.speed ?? 8;
  const weaponId = classConfig?.weaponType ?? 'smg';
  const weapon = WEAPONS.weapons[weaponId as keyof typeof WEAPONS.weapons];
  const fireRate = weapon?.rof ?? 0.15;

  // Initialize player HP from class
  useEffect(() => {
    if (classConfig) {
      useGameStore.setState({ playerHp: classConfig.hp, maxHp: classConfig.hp });
    }
  }, [classConfig]);

  // Fire control hook
  const { startFire, stopFire } = useFireControl({
    onFire: () => fireBullet(),
    fireRate: fireRate * 1000,
    autoFire: true,
  });

  // Create scene
  useEffect(() => {
    if (!engine) return;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.02, 0.04, 0.08, 1);
    sceneRef.current = scene;

    // Glow layer
    const glowLayer = new GlowLayer('glow', scene);
    glowLayer.intensity = 0.6;

    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3.5,
      40,
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 25;
    camera.upperRadiusLimit = 50;
    cameraRef.current = camera;

    // Lighting
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0.3), scene);
    ambient.intensity = 0.4;
    ambient.diffuse = new Color3(0.6, 0.7, 0.9);

    const moon = new PointLight('moon', new Vector3(-30, 50, -20), scene);
    moon.intensity = 0.6;
    moon.diffuse = new Color3(0.7, 0.8, 1);

    // Ground
    const gridSize = TERRAIN.terrain.gridSize;
    const ground = MeshBuilder.CreateGround('ground', { width: gridSize * 2, height: gridSize * 2 }, scene);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.03, 0.06, 0.1);
    ground.material = groundMat;

    // Player
    const player = MeshBuilder.CreateCylinder('player', { height: 2, diameter: 1 }, scene);
    player.position.y = 1;
    const playerMat = new StandardMaterial('playerMat', scene);
    playerMat.diffuseColor = new Color3(0.2, 0.9, 0.4);
    playerMat.emissiveColor = new Color3(0, 0.4, 0.15);
    player.material = playerMat;
    playerRef.current = player;

    // Trees
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * gridSize * 1.5;
      const z = (Math.random() - 0.5) * gridSize * 1.5;
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;

      const foliage = MeshBuilder.CreateCylinder(`foliage-${i}`, { height: 5, diameterTop: 0, diameterBottom: 3 }, scene);
      foliage.position = new Vector3(x, 4, z);
      const foliageMat = new StandardMaterial(`foliageMat-${i}`, scene);
      foliageMat.diffuseColor = new Color3(0.05, 0.25, 0.1);
      foliage.material = foliageMat;
    }

    // Spawn initial enemies
    for (let i = 0; i < SPAWN_CONFIG.initialMinions; i++) {
      spawnEnemy(scene);
    }

    // Game loop
    scene.onBeforeRenderObservable.add(() => {
      updateGame(scene);
    });

    return () => {
      scene.dispose();
    };
  }, [engine]); // spawnEnemy and updateGame are stable useCallback functions

  const spawnEnemy = useCallback((scene: Scene) => {
    const store = useGameStore.getState();
    if (store.state === 'BOSS_FIGHT') return;

    const player = playerRef.current;
    if (!player) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = SPAWN_CONFIG.minionSpawnRadiusMin +
      Math.random() * (SPAWN_CONFIG.minionSpawnRadiusMax - SPAWN_CONFIG.minionSpawnRadiusMin);

    const x = player.position.x + Math.cos(angle) * distance;
    const z = player.position.z + Math.sin(angle) * distance;

    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'minion',
      position: { x, y: 1, z },
      hp: ENEMY_CONFIG.hp,
      maxHp: ENEMY_CONFIG.hp,
      speed: ENEMY_CONFIG.speed,
      pointValue: ENEMY_CONFIG.pointValue,
      damage: ENEMY_CONFIG.damage,
    };

    useGameStore.getState().addEnemy(enemy);

    // Create mesh
    const mesh = MeshBuilder.CreateSphere(enemy.id, { diameter: 1.5 }, scene);
    mesh.position = new Vector3(x, 1, z);
    const mat = new StandardMaterial(`${enemy.id}-mat`, scene);
    mat.diffuseColor = new Color3(0.8, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.4, 0, 0);
    mesh.material = mat;
    enemyMeshesRef.current.set(enemy.id, mesh);
  }, []);

  const fireBullet = useCallback(() => {
    const scene = sceneRef.current;
    const player = playerRef.current;
    if (!scene || !player || !weapon) return;

    const store = useGameStore.getState();
    const enemies = store.enemies;

    // Find nearest enemy
    let target: Vector3 | null = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      const dx = enemy.position.x - player.position.x;
      const dz = enemy.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        target = new Vector3(enemy.position.x, 1, enemy.position.z);
      }
    }

    // Check boss
    const bossMesh = bossMeshRef.current;
    if (bossMesh && store.isBossActive) {
      const dx = bossMesh.position.x - player.position.x;
      const dz = bossMesh.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        target = bossMesh.position.clone();
      }
    }

    if (!target) return;

    const direction = target.subtract(player.position).normalize();

    const bullet: Bullet = {
      id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: weapon.bulletType as 'cannon' | 'smg' | 'star',
      position: { x: player.position.x, y: 1, z: player.position.z },
      velocity: { x: direction.x * weapon.speed, y: 0, z: direction.z * weapon.speed },
      damage: weapon.damage,
      ttl: weapon.life * 1000,
      ownerId: 'player',
    };

    useGameStore.getState().addBullet(bullet);

    // Create mesh
    const size = bullet.type === 'cannon' ? 0.5 : bullet.type === 'star' ? 0.4 : 0.25;
    const mesh = MeshBuilder.CreateSphere(bullet.id, { diameter: size }, scene);
    mesh.position = new Vector3(bullet.position.x, bullet.position.y, bullet.position.z);
    const mat = new StandardMaterial(`${bullet.id}-mat`, scene);
    const colors: Record<string, Color3> = {
      cannon: new Color3(1, 0.5, 0),
      smg: new Color3(0, 1, 0.8),
      star: new Color3(1, 1, 0),
    };
    mat.diffuseColor = colors[bullet.type] || colors.smg;
    mat.emissiveColor = mat.diffuseColor.scale(0.8);
    mesh.material = mat;
    bulletMeshesRef.current.set(bullet.id, mesh);
  }, [weapon]);

  const updateGame = useCallback((scene: Scene) => {
    const store = useGameStore.getState();
    if (store.state !== 'PHASE_1' && store.state !== 'BOSS_FIGHT') return;

    const deltaTime = scene.getEngine().getDeltaTime() / 1000;
    const now = performance.now();
    const player = playerRef.current;
    const camera = cameraRef.current;

    if (!player || !camera) return;

    // Player movement from joystick
    if (Math.abs(moveDir.x) > 0.1 || Math.abs(moveDir.y) > 0.1) {
      player.position.x += moveDir.x * playerSpeed * deltaTime;
      player.position.z += moveDir.y * playerSpeed * deltaTime;

      // Clamp to bounds
      const bound = TERRAIN.terrain.gridSize;
      player.position.x = Math.max(-bound, Math.min(bound, player.position.x));
      player.position.z = Math.max(-bound, Math.min(bound, player.position.z));

      useGameStore.getState().setPlayerPosition({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      });
    }

    // Camera follow
    camera.target = player.position.clone();

    // Auto-fire
    if (now - lastFireTimeRef.current >= fireRate * 1000) {
      fireBullet();
      lastFireTimeRef.current = now;
    }

    // Spawn enemies
    if (store.state === 'PHASE_1' && now - lastSpawnTimeRef.current >= 2000) {
      if (store.enemies.length < 20) {
        spawnEnemy(scene);
      }
      lastSpawnTimeRef.current = now;
    }

    // Update enemies
    for (const enemy of store.enemies) {
      const mesh = enemyMeshesRef.current.get(enemy.id);
      if (!mesh) continue;

      const dx = player.position.x - enemy.position.x;
      const dz = player.position.z - enemy.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.5) {
        const moveX = (dx / dist) * enemy.speed * deltaTime;
        const moveZ = (dz / dist) * enemy.speed * deltaTime;
        enemy.position.x += moveX;
        enemy.position.z += moveZ;
        mesh.position.x = enemy.position.x;
        mesh.position.z = enemy.position.z;
      }

      // Damage player
      if (dist < SPAWN_CONFIG.hitRadiusMinion + 0.5) {
        if (now - lastDamageTimeRef.current >= SPAWN_CONFIG.damageCooldown) {
          useGameStore.setState({ playerHp: Math.max(0, store.playerHp - enemy.damage) });
          lastDamageTimeRef.current = now;
        }
      }
    }

    // Update bullets
    const bulletsToRemove: string[] = [];
    for (const bullet of store.bullets) {
      const mesh = bulletMeshesRef.current.get(bullet.id);
      if (!mesh) continue;

      bullet.position.x += bullet.velocity.x * deltaTime;
      bullet.position.z += bullet.velocity.z * deltaTime;
      mesh.position.x = bullet.position.x;
      mesh.position.z = bullet.position.z;

      bullet.ttl -= deltaTime * 1000;
      if (bullet.ttl <= 0) {
        bulletsToRemove.push(bullet.id);
        continue;
      }

      // Check enemy collisions
      for (const enemy of store.enemies) {
        const dx = bullet.position.x - enemy.position.x;
        const dz = bullet.position.z - enemy.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < SPAWN_CONFIG.hitRadiusMinion) {
          const newHp = enemy.hp - bullet.damage;
          useGameStore.getState().damageEnemy(enemy.id, bullet.damage);

          if (newHp <= 0) {
            useGameStore.getState().removeEnemy(enemy.id);
            useGameStore.getState().addKill(enemy.pointValue);
            const enemyMesh = enemyMeshesRef.current.get(enemy.id);
            if (enemyMesh) {
              enemyMesh.dispose();
              enemyMeshesRef.current.delete(enemy.id);
            }
          }

          bulletsToRemove.push(bullet.id);
          break;
        }
      }

      // Check boss collision
      const bossMesh = bossMeshRef.current;
      if (bossMesh && store.isBossActive) {
        const dx = bullet.position.x - bossMesh.position.x;
        const dz = bullet.position.z - bossMesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < SPAWN_CONFIG.hitRadiusBoss) {
          useGameStore.getState().setBossHp(store.bossHp - bullet.damage);
          bulletsToRemove.push(bullet.id);
        }
      }
    }

    // Remove bullets
    for (const id of bulletsToRemove) {
      useGameStore.getState().removeBullet(id);
      const mesh = bulletMeshesRef.current.get(id);
      if (mesh) {
        mesh.dispose();
        bulletMeshesRef.current.delete(id);
      }
    }

    // Boss spawn
    if (store.state === 'PHASE_1' && store.kills >= KILLS_FOR_BOSS) {
      spawnBoss(scene);
    }

    // Update boss
    const bossMesh = bossMeshRef.current;
    if (bossMesh && store.isBossActive) {
      const dx = player.position.x - bossMesh.position.x;
      const dz = player.position.z - bossMesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 4) {
        bossMesh.position.x += (dx / dist) * BOSS_CONFIG.speed * deltaTime;
        bossMesh.position.z += (dz / dist) * BOSS_CONFIG.speed * deltaTime;
      }
      bossMesh.rotation.y += deltaTime * 0.5;

      if (dist < SPAWN_CONFIG.hitRadiusBoss + 0.5) {
        if (now - lastDamageTimeRef.current >= SPAWN_CONFIG.damageCooldown) {
          useGameStore.setState({ playerHp: Math.max(0, store.playerHp - BOSS_CONFIG.damage) });
          lastDamageTimeRef.current = now;
        }
      }
    }

    // Check game over
    if (store.playerHp <= 0) {
      useGameStore.setState({ state: 'GAME_OVER' });
    }

    // Check victory
    if (store.state === 'BOSS_FIGHT' && store.bossHp <= 0) {
      useGameStore.setState({ state: 'VICTORY' });
    }
  }, [moveDir, playerSpeed, fireRate, fireBullet, spawnEnemy]); // spawnBoss is stable

  const spawnBoss = useCallback((scene: Scene) => {
    const player = playerRef.current;
    if (!player) return;

    const angle = Math.random() * Math.PI * 2;
    const x = player.position.x + Math.cos(angle) * 30;
    const z = player.position.z + Math.sin(angle) * 30;

    const boss = MeshBuilder.CreateSphere('boss', { diameter: 6 }, scene);
    boss.position = new Vector3(x, 3, z);
    const mat = new StandardMaterial('bossMat', scene);
    mat.diffuseColor = new Color3(0.1, 0.6, 0.1);
    mat.emissiveColor = new Color3(0, 0.3, 0);
    boss.material = mat;
    bossMeshRef.current = boss;

    useGameStore.getState().activateBoss();
    useGameStore.setState({ state: 'BOSS_FIGHT' });
  }, []);

  const handleJoystickMove = useCallback((x: number, y: number) => {
    setMoveDir({ x, y });
  }, []);

  const handleJoystickRelease = useCallback(() => {
    setMoveDir({ x: 0, y: 0 });
  }, []);

  return (
    <GestureHandler
      onTap={startFire}
      onLongPressStart={startFire}
      onLongPressEnd={stopFire}
      style={styles.gameContainer}
    >
      <EngineView style={styles.engineView} />
      <HUD />
      <View style={styles.joystickContainer}>
        <VirtualJoystick
          onMove={handleJoystickMove}
          onRelease={handleJoystickRelease}
          size={120}
        />
      </View>
    </GestureHandler>
  );
}

function HUD() {
  const hp = useGameStore((s) => s.playerHp);
  const maxHp = useGameStore((s) => s.maxHp);
  const kills = useGameStore((s) => s.kills);
  const level = useGameStore((s) => s.playerLevel);
  const state = useGameStore((s) => s.state);
  const bossHp = useGameStore((s) => s.bossHp);
  const maxBossHp = useGameStore((s) => s.maxBossHp);

  const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const bossPercent = maxBossHp > 0 ? (bossHp / maxBossHp) * 100 : 0;

  return (
    <View style={styles.hud}>
      <View style={styles.hudLeft}>
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>HP</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, styles.hpBar, { width: `${hpPercent}%` }]} />
          </View>
          <Text style={styles.statValue}>{hp}</Text>
        </View>
        <Text style={styles.levelText}>LV {level}</Text>
      </View>

      <View style={styles.hudCenter}>
        {state === 'BOSS_FIGHT' && (
          <View style={styles.bossBar}>
            <Text style={styles.bossName}>GRINCH-BOT</Text>
            <View style={styles.bossBg}>
              <View style={[styles.barFill, styles.bossHpBar, { width: `${bossPercent}%` }]} />
            </View>
          </View>
        )}
        {state === 'PHASE_1' && (
          <View style={styles.killCounter}>
            <Text style={styles.killText}>KILLS: {kills}/{KILLS_FOR_BOSS}</Text>
          </View>
        )}
      </View>

      <View style={styles.hudRight}>
        <Text style={styles.killsText}>KILLS: {kills}</Text>
      </View>
    </View>
  );
}

function GameOverScreen() {
  const reset = useGameStore((s) => s.reset);
  const score = useGameStore((s) => s.score);
  const kills = useGameStore((s) => s.kills);

  return (
    <View style={styles.endScreen}>
      <Text style={styles.endTitle}>OPERATOR DOWN</Text>
      <View style={styles.statsBox}>
        <Text style={styles.statsText}>Final Score: {score}</Text>
        <Text style={styles.statsText}>Enemies: {kills}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>RETRY MISSION</Text>
      </TouchableOpacity>
    </View>
  );
}

function VictoryScreen() {
  const reset = useGameStore((s) => s.reset);
  const score = useGameStore((s) => s.score);
  const kills = useGameStore((s) => s.kills);
  const level = useGameStore((s) => s.playerLevel);

  return (
    <View style={styles.endScreenVictory}>
      <Text style={styles.victoryTitle}>MISSION COMPLETE</Text>
      <Text style={styles.victorySubtitle}>Christmas is Saved!</Text>
      <View style={styles.statsBox}>
        <Text style={styles.statsText}>Final Score: {score}</Text>
        <Text style={styles.statsText}>Enemies: {kills}</Text>
        <Text style={styles.statsText}>Level: {level}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>NEW GAME</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  // Menu
  menu: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: '#00ffcc', fontWeight: 'bold' },
  titleHighlight: { fontSize: 32, color: '#ff3366', fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#666', letterSpacing: 3, marginBottom: 30 },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30, gap: 10 },
  classCard: {
    borderWidth: 2, borderColor: '#00ffcc33', backgroundColor: '#0a1520',
    padding: 15, width: SCREEN_WIDTH * 0.28, alignItems: 'center',
  },
  classCardSelected: { borderColor: '#ff3366', backgroundColor: '#1a0a15' },
  className: { fontSize: 12, color: '#00ffcc', fontWeight: 'bold', marginBottom: 4 },
  classNameSelected: { color: '#ff3366' },
  classRole: { fontSize: 9, color: '#888', marginBottom: 4 },
  classStats: { fontSize: 9, color: '#666' },
  button: { backgroundColor: '#00ffcc', paddingVertical: 15, paddingHorizontal: 40 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // Briefing
  briefing: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  briefingTitle: { fontSize: 24, color: '#ff3366', fontWeight: 'bold', marginBottom: 30 },
  briefingContent: { backgroundColor: '#0a152088', borderWidth: 1, borderColor: '#00ffcc44', padding: 20, marginBottom: 30, width: '90%' },
  briefingLabel: { fontSize: 10, color: '#00ffcc', letterSpacing: 2, marginTop: 10 },
  briefingValue: { fontSize: 14, color: '#ccc', marginBottom: 5 },

  // Game
  gameContainer: { flex: 1 },
  engineView: { flex: 1 },
  joystickContainer: { position: 'absolute', bottom: 30, left: 30 },

  // HUD
  hud: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
  hudLeft: { backgroundColor: '#0a152088', borderWidth: 1, borderColor: '#00ffcc44', padding: 10, minWidth: 100 },
  hudCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  hudRight: { backgroundColor: '#0a152088', borderWidth: 1, borderColor: '#00ffcc44', padding: 10 },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { color: '#888', fontSize: 10, width: 20 },
  statValue: { color: '#00ffcc', fontSize: 10, width: 30, textAlign: 'right' },
  barBg: { flex: 1, height: 8, backgroundColor: '#1a2530', overflow: 'hidden' },
  barFill: { height: '100%' },
  hpBar: { backgroundColor: '#ff3366' },
  levelText: { color: '#00ffcc', fontSize: 10, marginTop: 5 },
  killsText: { color: '#00ffcc', fontSize: 12 },
  bossBar: { backgroundColor: '#1a0a1588', borderWidth: 1, borderColor: '#ff3366', padding: 8, alignItems: 'center' },
  bossName: { color: '#ff3366', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  bossBg: { width: 150, height: 10, backgroundColor: '#1a2530' },
  bossHpBar: { backgroundColor: '#00ff66' },
  killCounter: { backgroundColor: '#0a152088', borderWidth: 1, borderColor: '#00ffcc44', padding: 8 },
  killText: { color: '#00ffcc', fontSize: 12, letterSpacing: 1 },

  // End screens
  endScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  endScreenVictory: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#050a05' },
  endTitle: { fontSize: 28, color: '#ff3366', fontWeight: 'bold', marginBottom: 20 },
  victoryTitle: { fontSize: 28, color: '#00ff66', fontWeight: 'bold', marginBottom: 10 },
  victorySubtitle: { fontSize: 18, color: '#00ffcc', marginBottom: 20 },
  statsBox: { backgroundColor: '#0a152088', borderWidth: 1, borderColor: '#00ffcc44', padding: 20, marginBottom: 30, minWidth: 200, alignItems: 'center' },
  statsText: { color: '#ccc', fontSize: 14, marginVertical: 3 },
});
