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
**Year 2084:** Hijacked by the rogue AI KRAMPUS-PRIME, the North Pole's defense grid has turned festive logistics into lethal weaponry. Three prototype mechs are deployed to neutralize the quantum core before Christmas is lost forever.

---

## 📖 Game Manual
**[📘 Read the Full Player's Guide](docs/GAME_MANUAL.md)**

### Quick Start
Eliminate 10 Grinch-Bots to draw out KRAMPUS-PRIME. Choose your mech, collect XP for upgrades, and save the holidays.

**Controls:**
- **Desktop:** WASD/Arrows to move, SPACE to fire, 1-9 to switch weapons.
- **Mobile:** Touch joystick (left) + FIRE button (right).

---

## 🤖 Operator Classes & Unlocks
The game is now fully **Data-Driven (v4.0)**. Mechs, Weapons, and Upgrades are loaded from JSON DDLs.

- **Roguelike Upgrades**: Choose 1 of 3 enhancements every level-up.
- **Santa's Workshop**: Permanent meta-progression hub for weapons, skins, and stats.
- **Weapon Evolution**: Reach level 10 to evolve your base weapon into a high-tier variant.

---

## 👾 Enemies
- **Grinch-Bots**: Fast, swarming drones.
- **KRAMPUS-PRIME**: The final boss. Red vignette intensifies with proximity.

---

## 🏆 Scoring & Nice Points
- Earn **Nice Points (NP)** by building kill streaks and defeating the boss.
- NP persists across runs and is spent in the **Workshop**.

---

## 🛠️ Technical Features
- **Engine**: Three.js + React Three Fiber + Strata
- **Architecture**: Content-agnostic DDL (Data Definition Layer)
- **Performance**: Instanced rendering for swarms and projectiles
- **Audio**: Data-driven procedural synthesis via Tone.js
- **PWA**: Fully installable mobile application

---

## 💻 Development
```bash
pnpm install
pnpm dev
```
Check `docs/IMPLEMENTATION_STATUS.md` for the current roadmap.

---

**🎅 Happy Holidays! Save Christmas! 🎄**
