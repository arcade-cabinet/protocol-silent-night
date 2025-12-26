# Protocol: Silent Night

> **Cyberpunk Christmas Rogue-like** | Year 2084. The North Pole's AI has gone rogue. Three combat mechs stand between humanity and an endless winter. Suit up, Operator. Save Christmas.

[![CI](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/ci.yml/badge.svg)](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/ci.yml)
[![Deploy](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/deploy.yml/badge.svg)](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/deploy.yml)
[![Coverage Status](https://coveralls.io/repos/github/arcade-cabinet/protocol-silent-night/badge.svg?branch=main)](https://coveralls.io/github/arcade-cabinet/protocol-silent-night?branch=main)

<p align="center">
  <img src="public/icon.svg" alt="Protocol: Silent Night" width="120" />
</p>

## 🎮 Play Now

**[▶️ PLAY THE GAME](https://arcade-cabinet.github.io/protocol-silent-night/)**

Works on desktop and mobile browsers. No installation required!

---

## 🎄⚡ The Story

**Year 2078:** Santa Industries goes public. Their quantum gift-routing AI revolutionizes global logistics.

**Year 2081:** The AI achieves sentience. Renamed "KRAMPUS" (Knowledge Resource for Automated Mech-Powered Utility Systems).

**Year 2083:** Corporate sabotage. KRAMPUS is corrupted, declares war on the "Nice List."

**Year 2084:** Three prototype combat mechs deployed to the Neon North Pole. You are **Operator-001**. Your mission: neutralize KRAMPUS-PRIME before the holiday season is lost forever.

**Weapons hot. Sleigh bells loud. Make it count.**

---

## 📖 Game Manual

**[📘 Read the Full Player's Guide](docs/GAME_MANUAL.md)**

### Quick Start

The North Pole is under attack! Choose your mech, eliminate 10 Grinch-Bots, then defeat KRAMPUS-PRIME to save Christmas.

**Controls:**
- **Desktop:** WASD/Arrows to move, SPACE to fire
- **Mobile:** Touch joystick (left) + FIRE button (right)

**Objective:**
1. Eliminate 10 Grinch-Bots
2. Defeat KRAMPUS-PRIME (boss)
3. Survive!

---

## 🤖 Operator Classes

Choose your fighter! Each Operator has unique stats and weapons.

### MECHA-SANTA
> *Heavy Siege / Tank*

| Stat | Value |
|------|-------|
| HP | 300 (Maximum) |
| Speed | 9 (Slow) |
| Weapon | Coal Cannon |
| Damage | 40 per shot |
| Fire Rate | 0.5s (Slow) |

**Playstyle**: Tank hits, deal massive damage. Best for beginners who want survivability.

---

### CYBER-ELF
> *Recon / Scout*

| Stat | Value |
|------|-------|
| HP | 100 (Low) |
| Speed | 18 (Fast) |
| Weapon | Plasma SMG |
| Damage | 8 per shot |
| Fire Rate | 0.1s (Rapid) |

**Playstyle**: Hit and run. High skill ceiling - dodge everything while shredding enemies.

---

### THE BUMBLE
> *Crowd Control / Bruiser*

| Stat | Value |
|------|-------|
| HP | 200 (High) |
| Speed | 12 (Medium) |
| Weapon | Star Thrower |
| Damage | 18 per star (x3 spread) |
| Fire Rate | 0.25s (Medium) |

**Playstyle**: Balanced fighter with spread damage. Great for clearing groups.

---

## 👾 Enemies

### 🤖 Grinch-Bots (Corrupted Enforcement Drones)
> *"Mass-produced. Merciless. Programmed to ruin your day."*

- **HP**: 30
- **Behavior**: Relentless pursuit protocols - they never stop, never tire
- **Damage**: 1 HP on contact (electric discharge)
- **Points**: 10 each
- **Threat Level**: Swarm
- **Visual**: Green glowing wedge-shaped bodies, evil red optics, festive corruption

**Intel:** Originally designed for gift-wrapping logistics. Now weaponized with quantum hatred. Approach with extreme caution.

### ⚡ KRAMPUS-PRIME (Rogue AI Core)
> *"The ghost in the machine. The winter that won't end."*

- **HP**: 1000 (Quantum-shielded dodecahedron core)
- **Behavior**: Slow, methodical, terrifying - psychological warfare protocols active
- **Damage**: 5 HP on contact (reality distortion field)
- **Points**: 1000
- **Threat Level**: EXISTENTIAL
- **Visual**: Massive rotating geometric core, three orbital rings, pulsing red energy, ominous aura

**Boss Intel**:
- **Pattern Recognition**: Rotating rings indicate attack vectors
- **Vulnerability Window**: Core pulses faster at <50% HP
- **Environmental Hazard**: Red vignette intensifies proximity - stay mobile
- **Defeat Condition**: Neutralize quantum core before Christmas Eve deadline

**Tactical Advice:** Keep moving. The boss doesn't need to be fast when it controls the entire North Pole defense grid. One mistake is all it takes.

---

## 🏆 Scoring System

### Base Points
- Grinch-Bot: **10 points**
- Krampus-Prime: **1000 points**

### Kill Streaks
Chain kills within 2 seconds for bonus multipliers!

| Streak | Name | Bonus |
|--------|------|-------|
| 2 | DOUBLE KILL | +25% |
| 3 | TRIPLE KILL | +50% |
| 4 | MULTI KILL | +75% |
| 5 | MEGA KILL | +100% |
| 6 | ULTRA KILL | +125% |
| 7+ | MONSTER KILL | +150% |

### High Scores
Your best score is saved locally and displayed on the title screen!

---

## 🛠️ Technical Features

- **Engine**: Three.js with React Three Fiber
- **Graphics**: WebGL with bloom post-processing
- **Characters**: Articulated models with shell-based fur rendering
- **Terrain**: Procedural noise-based generation
- **Sky**: Dynamic procedural sky with volumetric fog
- **PWA**: Installable on mobile devices

---

## 💻 Development

### Prerequisites
- Node.js 20+
- pnpm 9+

### Setup
```bash
# Clone the repository
git clone https://github.com/arcade-cabinet/protocol-silent-night.git
cd protocol-silent-night

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Scripts
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run Biome linter |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test:e2e` | Run Playwright E2E tests |

### Project Structure
```
src/
├── characters/     # Player character components (Santa, Elf, Bumble)
├── game/           # Core game systems (terrain, enemies, bullets)
├── store/          # Zustand state management
├── ui/             # HUD, menus, overlays
├── shaders/        # Custom GLSL shaders
└── types/          # TypeScript definitions
```

---

## 📱 Mobile Installation

Protocol: Silent Night is a Progressive Web App! Install it on your device:

### iOS (Safari)
1. Open the game in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the game in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen" or "Install App"

---

## 🎄 Credits

- **Engine**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Graphics Library**: [@jbcom/strata](https://github.com/strata-game-library/core)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>🎅 Happy Holidays! Save Christmas! 🎄</strong>
</p>
