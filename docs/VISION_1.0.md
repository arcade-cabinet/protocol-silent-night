# Protocol: Silent Night - 1.0 Vision
**Branch:** `release/1.0`
**Target:** Q1 2026
**Status:** Architectural Pivot In Progress

---

## The Vision

**Protocol: Silent Night 1.0** is a premium mobile-native cyberpunk Christmas roguelike that rivals native App Store games in quality, performance, and user experience. It is NOT a web game wrapped in Capacitor. It is a true native application.

---

## Core Pillars

### 1. Mobile-Native Performance
- 60fps on flagship devices (iPhone 15, Pixel 8)
- 30fps stable on mid-tier devices (iPhone SE, budget Android)
- Native GPU rendering via BabylonJS React Native
- < 15% battery drain per 30-minute session

### 2. Premium Game Feel
- Haptic feedback on every meaningful action
- Anime-style combat with DBZ-inspired visual explosions
- JRPG HUD that feels like classic Final Fantasy
- Isometric diorama aesthetic (FF7/Tactics inspired)

### 3. Data-Driven Architecture (Preserved)
- All game content defined in JSON DDLs
- Content-agnostic engine
- Rapid iteration without code changes
- Procedural character generation

### 4. True Offline-First
- Full game playable without network
- Local progression persistence
- Optional cloud sync for cross-device play

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Platform** | React Native + Expo SDK 54+ | Cross-platform native apps |
| **3D Engine** | BabylonJS React Native | Native GPU 3D rendering |
| **Declarative 3D** | Reactylon | JSX for BabylonJS components |
| **State** | Zustand | Global game state |
| **Navigation** | Expo Router | File-based routing |
| **Audio** | Tone.js | Procedural synth music/SFX |
| **Animations** | react-native-reanimated | Native-thread 60fps animations |
| **Build** | EAS Build | Cloud-native iOS/Android builds |
| **Distribution** | App Store / Play Store | Real app distribution |

---

## Architecture

```
protocol-silent-night/
├── apps/
│   ├── mobile/                 # React Native + Expo app
│   │   ├── app/               # Expo Router pages
│   │   │   ├── _layout.tsx    # Root layout
│   │   │   ├── index.tsx      # Start screen
│   │   │   ├── game.tsx       # Main game scene
│   │   │   └── workshop.tsx   # Santa's Workshop
│   │   ├── src/
│   │   │   ├── scenes/        # BabylonJS/Reactylon scenes
│   │   │   ├── components/    # React Native UI
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── stores/        # Zustand stores
│   │   ├── app.json           # Expo config
│   │   └── eas.json           # EAS Build config
│   │
│   └── web/                    # Legacy web version (maintenance)
│       └── [existing code]
│
├── packages/
│   └── game-core/              # Shared game logic
│       ├── data/               # JSON DDLs
│       │   ├── classes.json
│       │   ├── weapons.json
│       │   ├── enemies.json
│       │   ├── upgrades.json
│       │   └── ...
│       ├── systems/            # Game systems (combat, progression)
│       ├── types/              # TypeScript types
│       └── utils/              # Shared utilities
│
├── docs/                       # Documentation
├── .kiro/                      # Kiro specs & steering
└── pnpm-workspace.yaml         # Monorepo config
```

---

## Game Scene Structure (Reactylon)

```tsx
// apps/mobile/src/scenes/DioramaScene.tsx
import { Scene, ArcRotateCamera, HemisphericLight } from 'reactylon';
import { useGameStore } from '../stores/gameStore';

export function DioramaScene() {
  const { player, enemies, gameState } = useGameStore();

  return (
    <Scene clearColor="#111122">
      {/* Isometric Camera */}
      <ArcRotateCamera
        name="isoCam"
        alpha={Math.PI / 4}
        beta={Math.PI / 3}
        radius={30}
        ortho={true}
      />

      {/* FF7-style Lighting */}
      <HemisphericLight name="light" intensity={0.7} />

      {/* Hex Grid Floor */}
      <HexGrid tileSize={1} radius={10} />

      {/* Procedural Player Character */}
      <AnimeHero
        position={player.position}
        config={player.class}
        isMoving={player.isMoving}
        isFiring={player.isFiring}
      />

      {/* Enemy Swarm */}
      {enemies.map(enemy => (
        <EnemyUnit key={enemy.id} config={enemy} />
      ))}

      {/* Combat Effects */}
      <CombatEffects />
    </Scene>
  );
}
```

---

## Procedural Character System

Replacing @jbcom/strata with BabylonJS procedural generation:

```tsx
// apps/mobile/src/scenes/characters/AnimeHero.tsx
interface AnimeHeroProps {
  position: Vector3;
  config: ClassConfig;  // From classes.json
  isMoving: boolean;
  isFiring: boolean;
}

function AnimeHero({ position, config, isMoving, isFiring }: AnimeHeroProps) {
  return (
    <TransformNode position={position} scaling-y={config.height}>
      {/* Procedural Body (lofted splines, not primitives) */}
      <ProceduralTorso muscle={config.muscle} gender={config.gender} />

      {/* Animated Face (DynamicTexture canvas) */}
      <AnimeFace expression={isFiring ? 'attack' : 'idle'} />

      {/* Spiky Hair (ribbon meshes) */}
      <ProceduralHair color={config.hairColor} style={config.hairStyle} />

      {/* Rigged Limbs (controllable bones) */}
      <RiggedArms isAttacking={isFiring} />
      <RiggedLegs isMoving={isMoving} />

      {/* Equipment Slots */}
      <WeaponSlot weapon={config.weapon} />
    </TransformNode>
  );
}
```

---

## Combat System

Anime-style combat that "hides the toy smash problem":

```tsx
function CombatEffects() {
  const { activeClashes } = useGameStore();

  return (
    <>
      {activeClashes.map(clash => (
        <ClashEffect key={clash.id}>
          {/* Massive GPU particles (obscures collision) */}
          <ExplosionParticles position={clash.midpoint} count={20000} />

          {/* Camera shake/pullback */}
          <CameraShake intensity={0.5} duration={500} />

          {/* Screen flash (post-process) */}
          <GlowLayer intensity={2.0} />

          {/* Knockback animations */}
          <KnockbackTween target={clash.player} direction="back" />
          <KnockbackTween target={clash.enemy} direction="forward" />
        </ClashEffect>
      ))}
    </>
  );
}
```

---

## JRPG HUD System

Classic Final Fantasy-style HUD overlay:

```tsx
// apps/mobile/src/components/hud/GameHUD.tsx
function GameHUD() {
  const { player, enemies, gameState } = useGameStore();

  return (
    <View style={styles.hudContainer}>
      {/* Top: Status Bars */}
      <StatusPanel>
        <HPBar current={player.hp} max={player.maxHp} />
        <MPBar current={player.mp} max={player.maxMp} />
        <StreakCounter count={player.streak} />
      </StatusPanel>

      {/* Bottom: Command Menu (combat only) */}
      {gameState === 'COMBAT' && (
        <CommandMenu>
          <CommandButton label="Attack" onPress={handleAttack} />
          <CommandButton label="Skill" onPress={handleSkill} />
          <CommandButton label="Item" onPress={handleItem} />
          <CommandButton label="Defend" onPress={handleDefend} />
        </CommandMenu>
      )}

      {/* Floating Damage Numbers */}
      <DamagePopups />
    </View>
  );
}
```

---

## Data-Driven Content (Preserved)

All game content continues to live in JSON DDLs:

```json
// packages/game-core/data/classes.json
{
  "santa": {
    "name": "Mecha-Santa",
    "role": "Heavy Siege / Tank",
    "stats": {
      "hp": 300,
      "speed": 9
    },
    "visual": {
      "height": 1.8,
      "muscle": 1.2,
      "gender": "male",
      "hairColor": "#FFFFFF",
      "hairStyle": "bearded"
    },
    "weapon": "coal-cannon"
  }
}
```

---

## Migration Path

### What Gets Preserved
- All JSON DDLs (game content)
- Game logic (combat, progression, roguelike systems)
- Zustand store structure
- Tone.js audio synthesis
- All balancing/tuning work

### What Gets Rewritten
- 3D rendering (Three.js → BabylonJS)
- Character system (strata → procedural BabylonJS)
- Platform layer (Vite → Expo)
- UI components (CSS Modules → React Native)

### What Gets Added
- Native haptics
- Native navigation
- EAS Build pipeline
- App Store/Play Store deployment
- .kiro specs

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| FPS (flagship) | 60fps | Performance profiler |
| FPS (mid-tier) | 30fps stable | Real device testing |
| Load time | < 3s | Cold start measurement |
| App size | < 100MB | Build output |
| Battery (30min) | < 15% | Real device testing |
| Touch latency | < 100ms | Input response time |
| Crash rate | < 0.1% | Crash reporting |
| Test coverage | > 75% | Jest coverage |

---

## Timeline

### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up monorepo structure
- [ ] Configure Expo + EAS
- [ ] Integrate BabylonJS React Native
- [ ] Port isometric camera system
- [ ] Implement procedural character base

### Phase 2: Core Game (Weeks 4-6)
- [ ] Port DDL loaders
- [ ] Implement combat system
- [ ] Port progression systems
- [ ] Port audio system
- [ ] Implement HUD

### Phase 3: Polish (Weeks 7-8)
- [ ] Mobile controls optimization
- [ ] Performance profiling
- [ ] Haptic feedback
- [ ] Platform-specific testing

### Phase 4: Release (Week 9)
- [ ] App Store submission
- [ ] Play Store submission
- [ ] Documentation finalization
- [ ] Marketing assets

---

## The Standard

Protocol: Silent Night 1.0 will be the benchmark for what "mobile game built with modern JS tools" means. Not a web wrapper. Not a PWA compromise. A real, premium, native mobile game.

Every decision should be evaluated against: **"Does this make the mobile experience amazing?"**

If the answer is no, we don't ship it.

---

*Vision document for Protocol: Silent Night 1.0 - Release Branch*
