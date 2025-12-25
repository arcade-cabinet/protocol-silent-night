# Protocol: Silent Night

> **Arcade RPG Simulation** | Defend the North Pole from the Grinch-Bot invasion

[![CI](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/ci.yml/badge.svg)](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/ci.yml)
[![Deploy](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/deploy.yml/badge.svg)](https://github.com/arcade-cabinet/protocol-silent-night/actions/workflows/deploy.yml)

<p align="center">
  <img src="public/icon.svg" alt="Protocol: Silent Night" width="120" />
</p>

## 🎮 Play Now

**[▶️ PLAY THE GAME](https://arcade-cabinet.github.io/protocol-silent-night/)**

Works on desktop and mobile browsers. No installation required!

---

## 📖 Game Manual

### Mission Briefing

The North Pole is under attack! Grinch-Bots are invading, and only you can stop them. Choose your Operator, eliminate the threat, and defeat the fearsome **Krampus-Prime** to save Christmas.

### How to Play

#### Controls

| Platform | Movement | Fire |
|----------|----------|------|
| **Desktop** | WASD or Arrow Keys | Spacebar |
| **Mobile** | Left side touch joystick | Right side FIRE button |

#### Objective

1. **Phase 1**: Eliminate **10 Grinch-Bots** to summon the boss
2. **Boss Phase**: Destroy **Krampus-Prime** to win
3. **Don't die!** Your HP is shown in the top-left HUD

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

### Grinch-Bots (Minions)
- **HP**: 30
- **Behavior**: Chase the player relentlessly
- **Damage**: 1 HP on contact
- **Points**: 10 each

### Krampus-Prime (Boss)
- **HP**: 1000
- **Behavior**: Slow pursuit with intimidating presence
- **Damage**: 5 HP on contact
- **Points**: 1000

**Boss Tips**:
- Keep moving! The boss is slow but deadly
- The vignette intensifies as the boss takes damage
- Watch for the rotating rings - they indicate attack patterns

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
