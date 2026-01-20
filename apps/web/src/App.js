import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Protocol: Silent Night - Web App
 * Complete BabylonJS implementation with full game loop
 */
import { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, PointLight, Vector3, MeshBuilder, StandardMaterial, Color3, Color4, GlowLayer, KeyboardEventTypes, } from '@babylonjs/core';
import { useGameStore, CLASSES, ENEMIES, WEAPONS, TERRAIN } from '@protocol-silent-night/game-core';
// Game constants from DDL
const ENEMY_CONFIG = ENEMIES.minion;
const SPAWN_CONFIG = ENEMIES.spawnConfig;
const BOSS_CONFIG = ENEMIES.boss;
const KILLS_FOR_BOSS = 50;
export function App() {
    const state = useGameStore((s) => s.state);
    return (_jsxs("div", { className: "app", children: [state === 'MENU' && _jsx(MenuScreen, {}), state === 'BRIEFING' && _jsx(BriefingScreen, {}), (state === 'PHASE_1' || state === 'BOSS_FIGHT') && _jsx(GameCanvas, {}), state === 'GAME_OVER' && _jsx(GameOverScreen, {}), state === 'VICTORY' && _jsx(VictoryScreen, {}), (state === 'PHASE_1' || state === 'BOSS_FIGHT') && _jsx(HUD, {})] }));
}
function MenuScreen() {
    const selectClass = useGameStore((s) => s.selectClass);
    const setState = useGameStore((s) => s.setState);
    const selectedClass = useGameStore((s) => s.selectedClass);
    const handleSelect = (classType) => selectClass(classType);
    const handleStart = () => selectedClass && setState('BRIEFING');
    const classTypes = Object.keys(CLASSES);
    return (_jsxs("div", { className: "menu-screen", children: [_jsxs("h1", { className: "title", children: ["PROTOCOL: ", _jsx("span", { className: "highlight", children: "SILENT NIGHT" })] }), _jsx("p", { className: "subtitle", children: "BABYLONJS EDITION" }), _jsx("div", { className: "class-grid", children: classTypes.map((classType) => {
                    const cls = CLASSES[classType];
                    return (_jsxs("div", { className: 'class-card' + (selectedClass === classType ? ' selected' : ''), onClick: () => handleSelect(classType), children: [_jsx("h3", { children: cls.name }), _jsx("p", { children: cls.role }), _jsxs("p", { children: ["HP: ", cls.hp, " | SPEED: ", cls.speed] })] }, classType));
                }) }), _jsx("button", { onClick: handleStart, disabled: !selectedClass, children: "START MISSION" })] }));
}
function BriefingScreen() {
    const setState = useGameStore((s) => s.setState);
    const selectedClass = useGameStore((s) => s.selectedClass);
    const classConfig = selectedClass ? CLASSES[selectedClass] : null;
    return (_jsxs("div", { className: "briefing-screen", children: [_jsx("h2", { children: "MISSION BRIEFING" }), _jsxs("div", { className: "briefing-content", children: [_jsxs("p", { children: [_jsx("strong", { children: "OPERATOR:" }), " ", classConfig?.name] }), _jsxs("p", { children: [_jsx("strong", { children: "ROLE:" }), " ", classConfig?.role] }), _jsxs("p", { children: [_jsx("strong", { children: "OBJECTIVE:" }), " Eliminate Grinch-Bot forces"] }), _jsxs("p", { children: [_jsx("strong", { children: "INTEL:" }), " Defeat ", KILLS_FOR_BOSS, " minions to draw out the boss"] })] }), _jsx("button", { onClick: () => setState('PHASE_1'), children: "COMMENCE OPERATION" })] }));
}
function GameCanvas() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current)
            return;
        const engine = new Engine(canvasRef.current, true, { preserveDrawingBuffer: true });
        const game = new GameEngine(engine);
        gameRef.current = game;
        engine.runRenderLoop(() => {
            game.update();
            game.scene.render();
        });
        const handleResize = () => engine.resize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            game.dispose();
            engine.dispose();
        };
    }, []);
    return _jsx("canvas", { ref: canvasRef, className: "game-canvas" });
}
// ============================================================================
// GAME ENGINE - Full BabylonJS implementation
// ============================================================================
class GameEngine {
    engine;
    scene;
    player;
    playerSpeed;
    camera;
    // Input state
    keys = new Set();
    // Entity tracking
    enemyMeshes = new Map();
    bulletMeshes = new Map();
    bossMesh = null;
    // Timing
    lastFireTime = 0;
    lastSpawnTime = 0;
    lastDamageTime = 0;
    fireRate = 0.15; // seconds between shots
    spawnRate = 2000; // ms between spawns
    // Store references
    store = useGameStore.getState;
    constructor(engine) {
        this.engine = engine;
        this.scene = this.createScene();
        this.player = this.createPlayer();
        this.camera = this.createCamera();
        this.setupInput();
        this.setupLighting();
        this.createTerrain();
        this.spawnInitialEnemies();
        // Get player speed from selected class
        const selectedClass = this.store().selectedClass;
        const classConfig = selectedClass ? CLASSES[selectedClass] : null;
        this.playerSpeed = classConfig?.speed ?? 8;
        // Set weapon fire rate
        const weapon = classConfig?.weaponType;
        if (weapon && WEAPONS.weapons[weapon]) {
            this.fireRate = WEAPONS.weapons[weapon].rof;
        }
        // Initialize player HP from class config
        if (classConfig) {
            useGameStore.setState({ playerHp: classConfig.hp, maxHp: classConfig.hp });
        }
    }
    createScene() {
        const scene = new Scene(this.engine);
        scene.clearColor = new Color4(0.02, 0.04, 0.08, 1);
        // Add glow layer for neon effects
        const glowLayer = new GlowLayer('glow', scene);
        glowLayer.intensity = 0.8;
        return scene;
    }
    createPlayer() {
        // Create player as a glowing cylinder
        const player = MeshBuilder.CreateCylinder('player', { height: 2, diameter: 1 }, this.scene);
        player.position.y = 1;
        const mat = new StandardMaterial('playerMat', this.scene);
        mat.diffuseColor = new Color3(0.2, 0.9, 0.4);
        mat.emissiveColor = new Color3(0, 0.4, 0.15);
        mat.specularColor = new Color3(0.5, 1, 0.5);
        player.material = mat;
        return player;
    }
    createCamera() {
        const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3.5, // ~50 degree angle (isometric-ish)
        40, Vector3.Zero(), this.scene);
        camera.lowerRadiusLimit = 20;
        camera.upperRadiusLimit = 60;
        camera.lowerBetaLimit = 0.3;
        camera.upperBetaLimit = Math.PI / 2.5;
        return camera;
    }
    setupLighting() {
        // Ambient light
        const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0.3), this.scene);
        ambient.intensity = 0.4;
        ambient.diffuse = new Color3(0.6, 0.7, 0.9);
        ambient.groundColor = new Color3(0.1, 0.15, 0.2);
        // Key light (moonlight)
        const moon = new PointLight('moon', new Vector3(-30, 50, -20), this.scene);
        moon.intensity = 0.6;
        moon.diffuse = new Color3(0.7, 0.8, 1);
    }
    createTerrain() {
        // Ground
        const gridSize = TERRAIN.terrain.gridSize;
        const ground = MeshBuilder.CreateGround('ground', { width: gridSize * 2, height: gridSize * 2 }, this.scene);
        const groundMat = new StandardMaterial('groundMat', this.scene);
        groundMat.diffuseColor = new Color3(0.03, 0.06, 0.1);
        groundMat.specularColor = new Color3(0.05, 0.1, 0.15);
        ground.material = groundMat;
        // Create Christmas tree obstacles
        const numTrees = 20;
        for (let i = 0; i < numTrees; i++) {
            const x = (Math.random() - 0.5) * gridSize * 1.5;
            const z = (Math.random() - 0.5) * gridSize * 1.5;
            // Don't place too close to center (spawn area)
            if (Math.abs(x) < 8 && Math.abs(z) < 8)
                continue;
            // Tree trunk
            const trunk = MeshBuilder.CreateCylinder(`trunk-${i}`, { height: 1.5, diameter: 0.8 }, this.scene);
            trunk.position = new Vector3(x, 0.75, z);
            const trunkMat = new StandardMaterial(`trunkMat-${i}`, this.scene);
            trunkMat.diffuseColor = new Color3(0.3, 0.15, 0.05);
            trunk.material = trunkMat;
            // Tree foliage (cone)
            const foliage = MeshBuilder.CreateCylinder(`foliage-${i}`, { height: 5, diameterTop: 0, diameterBottom: 3 }, this.scene);
            foliage.position = new Vector3(x, 4, z);
            const foliageMat = new StandardMaterial(`foliageMat-${i}`, this.scene);
            foliageMat.diffuseColor = new Color3(0.05, 0.25, 0.1);
            foliageMat.emissiveColor = new Color3(0, 0.05, 0.02);
            foliage.material = foliageMat;
        }
        // Add some present boxes
        for (let i = 0; i < 8; i++) {
            const x = (Math.random() - 0.5) * gridSize;
            const z = (Math.random() - 0.5) * gridSize;
            if (Math.abs(x) < 5 && Math.abs(z) < 5)
                continue;
            const present = MeshBuilder.CreateBox(`present-${i}`, { size: 1.2 }, this.scene);
            present.position = new Vector3(x, 0.6, z);
            const presentMat = new StandardMaterial(`presentMat-${i}`, this.scene);
            const colors = [
                new Color3(0.8, 0.1, 0.1),
                new Color3(0.1, 0.6, 0.2),
                new Color3(0.8, 0.7, 0.1),
            ];
            presentMat.diffuseColor = colors[i % 3];
            presentMat.emissiveColor = presentMat.diffuseColor.scale(0.2);
            present.material = presentMat;
        }
    }
    setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this.keys.add(key);
            }
            else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                this.keys.delete(key);
            }
        });
    }
    spawnInitialEnemies() {
        for (let i = 0; i < SPAWN_CONFIG.initialMinions; i++) {
            this.spawnEnemy();
        }
    }
    spawnEnemy() {
        const store = this.store();
        if (store.state === 'BOSS_FIGHT')
            return; // Don't spawn minions during boss
        // Spawn at random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = SPAWN_CONFIG.minionSpawnRadiusMin +
            Math.random() * (SPAWN_CONFIG.minionSpawnRadiusMax - SPAWN_CONFIG.minionSpawnRadiusMin);
        const x = this.player.position.x + Math.cos(angle) * distance;
        const z = this.player.position.z + Math.sin(angle) * distance;
        const enemy = {
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
        this.createEnemyMesh(enemy);
    }
    createEnemyMesh(enemy) {
        const mesh = MeshBuilder.CreateSphere(enemy.id, { diameter: 1.5 }, this.scene);
        mesh.position = new Vector3(enemy.position.x, enemy.position.y, enemy.position.z);
        const mat = new StandardMaterial(`${enemy.id}-mat`, this.scene);
        mat.diffuseColor = new Color3(0.8, 0.1, 0.1);
        mat.emissiveColor = new Color3(0.4, 0, 0);
        mesh.material = mat;
        this.enemyMeshes.set(enemy.id, mesh);
    }
    spawnBoss() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30;
        const x = this.player.position.x + Math.cos(angle) * distance;
        const z = this.player.position.z + Math.sin(angle) * distance;
        // Create boss mesh
        this.bossMesh = MeshBuilder.CreateSphere('boss', { diameter: 6 }, this.scene);
        this.bossMesh.position = new Vector3(x, 3, z);
        const mat = new StandardMaterial('bossMat', this.scene);
        mat.diffuseColor = new Color3(0.1, 0.6, 0.1);
        mat.emissiveColor = new Color3(0, 0.3, 0);
        this.bossMesh.material = mat;
        // Add spikes to boss
        for (let i = 0; i < 8; i++) {
            const spike = MeshBuilder.CreateCylinder(`bossSpike-${i}`, { height: 2, diameterTop: 0, diameterBottom: 1 }, this.scene);
            spike.position.y = 2;
            spike.rotation.z = Math.PI / 4;
            spike.rotation.y = (i / 8) * Math.PI * 2;
            spike.parent = this.bossMesh;
            spike.material = mat;
        }
        useGameStore.getState().activateBoss();
        useGameStore.setState({ state: 'BOSS_FIGHT' });
    }
    fireBullet() {
        const store = this.store();
        const selectedClass = store.selectedClass;
        if (!selectedClass)
            return;
        const classConfig = CLASSES[selectedClass];
        const weaponId = classConfig.weaponType;
        const weapon = WEAPONS.weapons[weaponId];
        if (!weapon)
            return;
        // Find nearest enemy to aim at
        const enemies = store.enemies;
        let target = null;
        let minDist = Infinity;
        for (const enemy of enemies) {
            const dx = enemy.position.x - this.player.position.x;
            const dz = enemy.position.z - this.player.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < minDist) {
                minDist = dist;
                target = new Vector3(enemy.position.x, 1, enemy.position.z);
            }
        }
        // Also check boss
        if (this.bossMesh && store.isBossActive) {
            const dx = this.bossMesh.position.x - this.player.position.x;
            const dz = this.bossMesh.position.z - this.player.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < minDist) {
                target = this.bossMesh.position.clone();
            }
        }
        if (!target)
            return;
        // Calculate direction
        const direction = target.subtract(this.player.position).normalize();
        const bullet = {
            id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: weapon.bulletType,
            position: {
                x: this.player.position.x,
                y: 1,
                z: this.player.position.z
            },
            velocity: {
                x: direction.x * weapon.speed,
                y: 0,
                z: direction.z * weapon.speed,
            },
            damage: weapon.damage,
            ttl: weapon.life * 1000, // Convert seconds to ms
            ownerId: 'player',
        };
        useGameStore.getState().addBullet(bullet);
        this.createBulletMesh(bullet);
    }
    createBulletMesh(bullet) {
        const size = bullet.type === 'cannon' ? 0.5 : bullet.type === 'star' ? 0.4 : 0.25;
        const mesh = bullet.type === 'star'
            ? MeshBuilder.CreateTorus(bullet.id, { diameter: size * 2, thickness: size * 0.3 }, this.scene)
            : MeshBuilder.CreateSphere(bullet.id, { diameter: size }, this.scene);
        mesh.position = new Vector3(bullet.position.x, bullet.position.y, bullet.position.z);
        const mat = new StandardMaterial(`${bullet.id}-mat`, this.scene);
        const colors = {
            cannon: new Color3(1, 0.5, 0),
            smg: new Color3(0, 1, 0.8),
            star: new Color3(1, 1, 0),
        };
        mat.diffuseColor = colors[bullet.type] || colors.smg;
        mat.emissiveColor = mat.diffuseColor.scale(0.8);
        mesh.material = mat;
        this.bulletMeshes.set(bullet.id, mesh);
    }
    update() {
        const deltaTime = this.engine.getDeltaTime() / 1000;
        const store = this.store();
        if (store.state !== 'PHASE_1' && store.state !== 'BOSS_FIGHT')
            return;
        // Player movement
        this.updatePlayer(deltaTime);
        // Camera follow
        this.camera.target = this.player.position.clone();
        // Auto-fire
        const now = performance.now() / 1000;
        if (now - this.lastFireTime >= this.fireRate) {
            this.fireBullet();
            this.lastFireTime = now;
        }
        // Spawn enemies
        if (store.state === 'PHASE_1' && now * 1000 - this.lastSpawnTime >= this.spawnRate) {
            if (store.enemies.length < 20) {
                this.spawnEnemy();
            }
            this.lastSpawnTime = now * 1000;
        }
        // Update entities
        this.updateEnemies(deltaTime);
        this.updateBullets(deltaTime);
        this.updateBoss(deltaTime);
        // Check for boss spawn
        if (store.state === 'PHASE_1' && store.kills >= KILLS_FOR_BOSS) {
            this.spawnBoss();
        }
        // Check game over
        if (store.playerHp <= 0) {
            useGameStore.setState({ state: 'GAME_OVER' });
        }
        // Check victory
        if (store.state === 'BOSS_FIGHT' && store.bossHp <= 0) {
            useGameStore.setState({ state: 'VICTORY' });
        }
    }
    updatePlayer(deltaTime) {
        const moveDir = new Vector3(0, 0, 0);
        if (this.keys.has('w') || this.keys.has('arrowup'))
            moveDir.z -= 1;
        if (this.keys.has('s') || this.keys.has('arrowdown'))
            moveDir.z += 1;
        if (this.keys.has('a') || this.keys.has('arrowleft'))
            moveDir.x -= 1;
        if (this.keys.has('d') || this.keys.has('arrowright'))
            moveDir.x += 1;
        if (moveDir.length() > 0) {
            moveDir.normalize();
            this.player.position.addInPlace(moveDir.scale(this.playerSpeed * deltaTime));
            // Clamp to terrain bounds
            const bound = TERRAIN.terrain.gridSize;
            this.player.position.x = Math.max(-bound, Math.min(bound, this.player.position.x));
            this.player.position.z = Math.max(-bound, Math.min(bound, this.player.position.z));
            useGameStore.getState().setPlayerPosition({
                x: this.player.position.x,
                y: this.player.position.y,
                z: this.player.position.z,
            });
        }
    }
    updateEnemies(deltaTime) {
        const store = this.store();
        const now = performance.now();
        for (const enemy of store.enemies) {
            const mesh = this.enemyMeshes.get(enemy.id);
            if (!mesh)
                continue;
            // Move toward player
            const dx = this.player.position.x - enemy.position.x;
            const dz = this.player.position.z - enemy.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.5) {
                const moveX = (dx / dist) * enemy.speed * deltaTime;
                const moveZ = (dz / dist) * enemy.speed * deltaTime;
                enemy.position.x += moveX;
                enemy.position.z += moveZ;
                mesh.position.x = enemy.position.x;
                mesh.position.z = enemy.position.z;
            }
            // Check collision with player
            if (dist < SPAWN_CONFIG.hitRadiusMinion + 0.5) {
                if (now - this.lastDamageTime >= SPAWN_CONFIG.damageCooldown) {
                    const hp = store.playerHp - enemy.damage;
                    useGameStore.setState({ playerHp: Math.max(0, hp) });
                    this.lastDamageTime = now;
                    // Knockback
                    const knockDir = new Vector3(-dx / dist, 0, -dz / dist);
                    this.player.position.addInPlace(knockDir.scale(2));
                }
            }
        }
    }
    updateBullets(deltaTime) {
        const store = this.store();
        const bulletsToRemove = [];
        for (const bullet of store.bullets) {
            const mesh = this.bulletMeshes.get(bullet.id);
            if (!mesh)
                continue;
            // Move bullet
            bullet.position.x += bullet.velocity.x * deltaTime;
            bullet.position.z += bullet.velocity.z * deltaTime;
            mesh.position.x = bullet.position.x;
            mesh.position.z = bullet.position.z;
            // Reduce ttl
            bullet.ttl -= deltaTime * 1000; // deltaTime is in seconds, ttl in ms
            if (bullet.ttl <= 0) {
                bulletsToRemove.push(bullet.id);
                continue;
            }
            // Check collision with enemies
            for (const enemy of store.enemies) {
                const dx = bullet.position.x - enemy.position.x;
                const dz = bullet.position.z - enemy.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < SPAWN_CONFIG.hitRadiusMinion) {
                    // Damage enemy
                    const newHp = enemy.hp - bullet.damage;
                    useGameStore.getState().damageEnemy(enemy.id, bullet.damage);
                    if (newHp <= 0) {
                        // Kill enemy
                        useGameStore.getState().removeEnemy(enemy.id);
                        useGameStore.getState().addKill(enemy.pointValue);
                        const enemyMesh = this.enemyMeshes.get(enemy.id);
                        if (enemyMesh) {
                            enemyMesh.dispose();
                            this.enemyMeshes.delete(enemy.id);
                        }
                    }
                    bulletsToRemove.push(bullet.id);
                    break;
                }
            }
            // Check collision with boss
            if (this.bossMesh && store.isBossActive) {
                const dx = bullet.position.x - this.bossMesh.position.x;
                const dz = bullet.position.z - this.bossMesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < SPAWN_CONFIG.hitRadiusBoss) {
                    useGameStore.getState().setBossHp(store.bossHp - bullet.damage);
                    bulletsToRemove.push(bullet.id);
                }
            }
        }
        // Remove expired/hit bullets
        for (const id of bulletsToRemove) {
            useGameStore.getState().removeBullet(id);
            const mesh = this.bulletMeshes.get(id);
            if (mesh) {
                mesh.dispose();
                this.bulletMeshes.delete(id);
            }
        }
    }
    updateBoss(deltaTime) {
        const store = this.store();
        if (!this.bossMesh || !store.isBossActive)
            return;
        // Move toward player
        const dx = this.player.position.x - this.bossMesh.position.x;
        const dz = this.player.position.z - this.bossMesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 4) {
            const moveX = (dx / dist) * BOSS_CONFIG.speed * deltaTime;
            const moveZ = (dz / dist) * BOSS_CONFIG.speed * deltaTime;
            this.bossMesh.position.x += moveX;
            this.bossMesh.position.z += moveZ;
        }
        // Rotate boss
        this.bossMesh.rotation.y += deltaTime * 0.5;
        // Check collision with player
        if (dist < SPAWN_CONFIG.hitRadiusBoss + 0.5) {
            const now = performance.now();
            if (now - this.lastDamageTime >= SPAWN_CONFIG.damageCooldown) {
                const hp = store.playerHp - BOSS_CONFIG.damage;
                useGameStore.setState({ playerHp: Math.max(0, hp) });
                this.lastDamageTime = now;
            }
        }
    }
    dispose() {
        // Clean up all meshes
        for (const mesh of this.enemyMeshes.values()) {
            mesh.dispose();
        }
        for (const mesh of this.bulletMeshes.values()) {
            mesh.dispose();
        }
        if (this.bossMesh) {
            this.bossMesh.dispose();
        }
        this.scene.dispose();
    }
}
// ============================================================================
// UI Components
// ============================================================================
function HUD() {
    const hp = useGameStore((s) => s.playerHp);
    const maxHp = useGameStore((s) => s.maxHp);
    const level = useGameStore((s) => s.playerLevel);
    const kills = useGameStore((s) => s.kills);
    const xp = useGameStore((s) => s.playerXp);
    const xpToNext = useGameStore((s) => s.xpToNext);
    const state = useGameStore((s) => s.state);
    const bossHp = useGameStore((s) => s.bossHp);
    const maxBossHp = useGameStore((s) => s.maxBossHp);
    const hpPercent = (hp / maxHp) * 100;
    const xpPercent = (xp / xpToNext) * 100;
    const bossPercent = (bossHp / maxBossHp) * 100;
    return (_jsxs("div", { className: "hud", children: [_jsxs("div", { className: "hud-left", children: [_jsxs("div", { className: "stat-bar", children: [_jsx("span", { children: "HP" }), _jsx("div", { className: "bar-bg", children: _jsx("div", { className: "bar-fill hp", style: { width: `${hpPercent}%` } }) }), _jsxs("span", { children: [hp, "/", maxHp] })] }), _jsxs("div", { className: "stat-bar", children: [_jsx("span", { children: "XP" }), _jsx("div", { className: "bar-bg", children: _jsx("div", { className: "bar-fill xp", style: { width: `${xpPercent}%` } }) }), _jsxs("span", { children: ["LV ", level] })] })] }), _jsxs("div", { className: "hud-center", children: [state === 'BOSS_FIGHT' && (_jsxs("div", { className: "boss-bar", children: [_jsx("span", { children: "GRINCH-BOT SUPREME" }), _jsx("div", { className: "bar-bg boss", children: _jsx("div", { className: "bar-fill boss", style: { width: `${bossPercent}%` } }) })] })), state === 'PHASE_1' && (_jsxs("div", { className: "kill-counter", children: ["KILLS: ", kills, " / ", KILLS_FOR_BOSS] }))] }), _jsxs("div", { className: "hud-right", children: [_jsxs("p", { children: ["KILLS: ", kills] }), _jsx("p", { children: "WASD to move" })] })] }));
}
function GameOverScreen() {
    const reset = useGameStore((s) => s.reset);
    const score = useGameStore((s) => s.score);
    const kills = useGameStore((s) => s.kills);
    return (_jsxs("div", { className: "end-screen game-over", children: [_jsx("h1", { children: "OPERATOR DOWN" }), _jsxs("div", { className: "stats", children: [_jsxs("p", { children: ["Final Score: ", score] }), _jsxs("p", { children: ["Enemies Eliminated: ", kills] })] }), _jsx("button", { onClick: reset, children: "RETRY MISSION" })] }));
}
function VictoryScreen() {
    const reset = useGameStore((s) => s.reset);
    const score = useGameStore((s) => s.score);
    const kills = useGameStore((s) => s.kills);
    const level = useGameStore((s) => s.playerLevel);
    return (_jsxs("div", { className: "end-screen victory", children: [_jsx("h1", { children: "\uD83C\uDF84 MISSION COMPLETE \uD83C\uDF84" }), _jsx("h2", { children: "Christmas is Saved!" }), _jsxs("div", { className: "stats", children: [_jsxs("p", { children: ["Final Score: ", score] }), _jsxs("p", { children: ["Enemies Eliminated: ", kills] }), _jsxs("p", { children: ["Final Level: ", level] })] }), _jsx("button", { onClick: reset, children: "NEW GAME" })] }));
}
