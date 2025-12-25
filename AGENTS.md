# PROTOCOL: SILENT NIGHT // AGENT REGISTRY

**System Version:** 3.0 (Operator Edition)  
**Target Runtime:** React Three Fiber / Three.js / WebGL  
**Classification:** Arcade RPG Simulation  
**Architecture:** Modular TypeScript with Zustand State Management

---

## 1. OPERATOR AGENTS (Player Classes)

The user interfaces with the simulation via one of three distinct "Operator" chassis. Each possesses unique variable configurations for velocity, durability, and ballistic output.

### Class A: MECHA-SANTA

| Property | Value |
|----------|-------|
| **Role** | Heavy Siege / Tank |
| **Locomotion** | Low Speed (9 units/s) |
| **Durability** | Maximum (300 HP) |
| **Ballistics** | "Coal Cannon" |
| **Projectile Physics** | Single shot, high mass |
| **Damage** | 40 per hit |
| **Rate of Fire** | 0.5s delay |
| **Visual Signature** | Red (#ff0044) - Scale 1.4 |
| **Fur System** | Red/crimson shell layers with white trim |

**Character Features:**
- Fur-lined suit with collar and bottom trim (using Strata-inspired shell fur system)
- Black belt with golden buckle
- Iconic red hat with white fur trim
- Glowing cyan cybernetic eyes
- Coal Cannon weapon with muzzle flash effects

### Class B: CYBER-ELF

| Property | Value |
|----------|-------|
| **Role** | Recon / Scout |
| **Locomotion** | Hyper Speed (18 units/s) |
| **Durability** | Minimal (100 HP) |
| **Ballistics** | "Plasma SMG" |
| **Projectile Physics** | High velocity, low mass |
| **Damage** | 8 per hit |
| **Rate of Fire** | 0.1s delay (Rapid) |
| **Visual Signature** | Cyan (#00ffcc) - Scale 0.8 |
| **Fur System** | Cyan/teal shell layers for cyber-hair |

**Character Features:**
- Sleek cyber suit with glowing accent lines
- Pointed ears with subtle twitch animation
- Cyber-hair using shell fur technique
- Visor with glowing eye effect
- Plasma SMG with energy core
- Hover boots with glow effects

### Class C: THE BUMBLE

| Property | Value |
|----------|-------|
| **Role** | Crowd Control / Bruiser |
| **Locomotion** | Medium Speed (12 units/s) |
| **Durability** | High (200 HP) |
| **Ballistics** | "Star Thrower" |
| **Projectile Physics** | Spread pattern (3 projectiles at -0.2, 0, +0.2 rads) |
| **Damage** | 18 per hit |
| **Visual Signature** | White (#eeeeee) - Scale 1.6 |
| **Fur System** | Dense white 16-layer shell fur covering entire body |

**Character Features:**
- Full-body dense white fur (Abominable Snowman aesthetic)
- Horns with ivory material
- Glowing blue eyes
- Heavy lumbering movement animation
- Star Thrower weapon with golden star projectiles

---

## 2. THREAT VECTORS (Enemy AI)

Hostile agents are controlled by the central Game loop using stateless behavior trees.

### Type 1: MINION (Grinch-Bot)

| Property | Value |
|----------|-------|
| **Spawn Logic** | Procedural radial spawn (Distance: 25-35 units from center) |
| **Health** | 30 HP |
| **Speed** | 4-6 units/s (randomized) |
| **Damage** | 1 HP per hit |
| **Point Value** | 10 points |

**Behavior Loop:**
1. **Seek:** Calculate vector to Player
2. **Translate:** Move along vector at speed × dt
3. **Collision:** If distance to Player < 1.5:
   - Apply Damage (1 HP)
   - Apply Knockback (Invert velocity vector × 3)

**Visuals:** Green cone geometry with red glowing eyes, emissive flash on damage

### Type 2: BOSS (Krampus-Prime)

| Property | Value |
|----------|-------|
| **Trigger** | Spawns after WAVE_REQ (10) Minion eliminations |
| **Health** | 1000 HP (Boss Bar UI enabled) |
| **Speed** | 3 units/s |

**Behavior Loop:**
- **Phase "Chase":** Moves slowly toward player
- Rotates outer "Ring" geometry on X/Y axes for visual intimidation
- Emissive intensity increases as health decreases

**Visuals:**
- Dodecahedron Core (Dark Red) with high emissive intensity
- Rotating Torus Ring
- Secondary static ring
- Particle aura effect

---

## 3. SYSTEM DAEMONS (Game Manager)

### The Director (Game Store - Zustand)

The `gameStore` acts as the central state management system.

**State Machine:**
| State | Description |
|-------|-------------|
| `MENU` | Idle, rendering class selection |
| `PHASE_1` | Minion spawning active. Monitors Kill Count |
| `PHASE_BOSS` | Disables Minion spawning. Activates Boss UI |
| `WIN` | Halt physics, display victory overlay |
| `GAME_OVER` | Halt physics, display defeat overlay |

**Object Pooling:**
- Entities (Bullets, Enemies) are stored in arrays
- Entities are culled when life ≤ 0 or out of bounds
- Prevents memory leaks during long sessions

### The Architect (World Gen)

**Technology:** THREE.InstancedMesh

**Logic:**
1. Generates an 80×80 grid of cubes
2. Applies a pseudo-noise function using `Math.sin(x) * Math.cos(z)` to create wave-like terrain elevation
3. Applies a "Glitch" pass where random pillars are extruded vertically (0.5% chance)

**Rendering:**
- Custom GLSL Shader (`terrainFrag`) for "Tron-Grid" aesthetic
- Height-based color mixing (Dark Blue → Icy Blue)
- Grid line overlay effect

---

## 4. INPUT INTERFACE

The Input Agent normalizes data from touch surfaces and peripherals.

### Virtual Joystick
- **Dynamic Origin:** Center defined by `mousedown`/`touchstart` coordinates
- **Output:** Vector2 normalized (-1 to 1)
- **Zone:** Left 50% of screen

### Fire Control
- **Touch:** Right-side fire button
- **Keyboard:** Spacebar
- **Mouse:** Click on fire button

### Movement (Keyboard)
- **WASD** or **Arrow Keys**
- Diagonal movement is normalized

---

## 5. FUR RENDERING SYSTEM

Based on the Strata library's shell-based fur technique.

### Technique: Shell Layers
Multiple geometry layers extruded along normals with alpha-tested noise patterns.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `layers` | 12 | Number of shell layers |
| `spacing` | 0.025 | Distance between layers |
| `colorBase` | Per-character | Root color of fur |
| `colorTip` | Per-character | Tip color of fur |
| `windStrength` | 1.0 | Wind animation intensity |
| `gravityDroop` | 0.04 | Gravity effect on tips |

### Shader Features
- Multi-octave procedural noise for strand variation
- Alpha testing for strand tapering
- Base-to-tip color gradient
- Ambient occlusion at roots
- Rim lighting for depth
- Wind animation on tips
- Gravity droop effect

---

## 6. POST-PROCESSING

### Bloom Effect
- **Luminance Threshold:** 0.2
- **Intensity:** 1.2
- **Radius:** 0.5

Creates the signature neon glow aesthetic for emissive materials.

---

## 7. PROJECT STRUCTURE

```
src/
├── App.tsx                 # Main application component
├── main.tsx                # Entry point
├── vite-env.d.ts           # Vite type declarations
│
├── characters/             # Player character components
│   ├── index.ts
│   ├── SantaCharacter.tsx  # Mecha-Santa with fur trim
│   ├── ElfCharacter.tsx    # Cyber-Elf with visor
│   ├── BumbleCharacter.tsx # The Bumble with full fur
│   └── PlayerController.tsx # Movement & shooting logic
│
├── game/                   # Core game systems
│   ├── index.ts
│   ├── GameScene.tsx       # Main 3D scene
│   ├── Terrain.tsx         # Instanced terrain
│   ├── Bullets.tsx         # Projectile system
│   ├── Enemies.tsx         # Enemy spawning & AI
│   ├── Lighting.tsx        # Scene lighting
│   └── CameraController.tsx # Camera follow system
│
├── shaders/                # Custom GLSL shaders
│   ├── index.ts
│   ├── terrain.ts          # Tron-grid terrain shader
│   └── fur.ts              # Shell fur shader
│
├── store/                  # State management
│   └── gameStore.ts        # Zustand store
│
├── styles/                 # Global styles
│   └── global.css
│
├── types/                  # TypeScript definitions
│   └── index.ts            # Game types & constants
│
└── ui/                     # UI components
    ├── index.ts
    ├── HUD.tsx             # Health & objective display
    ├── HUD.module.css
    ├── BossHUD.tsx         # Boss health bar
    ├── BossHUD.module.css
    ├── MessageOverlay.tsx  # Warning messages
    ├── MessageOverlay.module.css
    ├── StartScreen.tsx     # Class selection
    ├── StartScreen.module.css
    ├── EndScreen.tsx       # Win/Lose screen
    ├── EndScreen.module.css
    ├── InputControls.tsx   # Touch/keyboard input
    └── InputControls.module.css
```

---

## 8. STRATA INTEGRATION OPPORTUNITIES

The [@jbcom/strata](https://github.com/strata-game-library/core) library provides additional features that could enhance this game:

### Currently Utilized Concepts
- **Fur Shell Rendering:** Our custom implementation is based on Strata's shell-based fur system

### Potential Enhancements with Strata

| Feature | Strata Component | Benefit |
|---------|------------------|---------|
| **Character System** | `createCharacter()` | Full articulated character with joints, IK |
| **Procedural Animation** | `animateCharacter()` | Walk cycles, idle animations |
| **Advanced Fur** | `createFurSystem()` | Integrated fur with animation updates |
| **Terrain** | SDF + Marching Cubes | More complex procedural terrain |
| **Water** | `<Water>` component | Reflective water areas |
| **Sky** | `<ProceduralSky>` | Dynamic day/night cycle |
| **Volumetrics** | `<VolumetricFogMesh>` | Atmospheric fog effects |
| **Vegetation** | `<GrassInstances>` | Snow-covered vegetation |

### Example Strata Integration

```tsx
import { createCharacter, animateCharacter, createFurSystem } from '@jbcom/strata';

// Create a furry character with full animation support
const { root, joints, state } = createCharacter({
  skinColor: 0xeeeeee,
  furOptions: {
    baseColor: 0xdddddd,
    tipColor: 0xffffff,
    layerCount: 16,
    windStrength: 0.8,
  },
  scale: 1.6,
});

// In animation loop
useFrame((_, delta) => {
  state.speed = isMoving ? state.maxSpeed : 0;
  animateCharacter({ root, joints, state }, time, delta);
});
```

---

*Generated for Protocol: Silent Night v3.0*
