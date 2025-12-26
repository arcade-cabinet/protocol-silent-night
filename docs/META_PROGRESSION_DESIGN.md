# Meta-Progression System Design
## Protocol: Silent Night - Christmas Cyberpunk Rogue-like

**Version:** 1.0
**Status:** Proposed
**Priority:** HIGH (Critical for replayability)

---

## 🎯 Vision

Transform Protocol: Silent Night from a **single-run arcade game** into a **deep, replayable rogue-like** with meaningful progression that respects player time while maintaining the "one more run" addictiveness of Vampire Survivors and Brotato.

---

## 🎁 Nice Points Currency System

### Concept
**"Nice Points"** - The universal currency earned through gameplay

**Flavor Text:**
> *"KRAMPUS-PRIME tracks who's naughty and nice. Prove you're on the right list."*

### Earning Nice Points
- **Kill Grinch-Bot:** +10 Nice Points
- **Kill Streak Bonus:**
  - 2x: +5 bonus
  - 3x: +10 bonus
  - 5x: +25 bonus
  - 7+: +50 bonus
- **Boss Defeat:** +500 Nice Points
- **Survive Wave:** +25 Nice Points
- **Perfect Run (No damage):** +200 bonus
- **High Score Beat:** +100 Nice Points

### Spending Nice Points
**Santa's Workshop** (main menu hub):
- Weapon unlocks: 500-2000 NP
- Character skins: 300-1000 NP
- Starting buffs: 250-750 NP
- Passive upgrades: 100-500 NP

**Persistent Storage:**
See [Technical Implementation](#-technical-implementation) for the data structure specification.

---

## 🔓 Unlockable Systems

### 1. Weapons (7 New Weapons)

#### ❄️ Snowball Launcher
- **Cost:** 500 NP
- **Type:** Projectile
- **Damage:** 12 per shot
- **Fire Rate:** 0.2s
- **Special:** Freezes enemies for 1s on hit
- **Flavor:** *"Neon-infused ice cores. Cold never bothered me anyway."*

#### 🍬 Candy Cane Staff
- **Cost:** 750 NP
- **Type:** Melee Sweep
- **Damage:** 25 per hit
- **Fire Rate:** 0.4s
- **Special:** 360° attack, heals 5 HP on kill
- **Flavor:** *"Peppermint-powered beatdown. Festive AND functional."*

#### 🎄 Ornament Bomb Launcher
- **Cost:** 1000 NP
- **Type:** AOE Explosive
- **Damage:** 50 per explosion
- **Fire Rate:** 1.0s
- **Special:** 5-unit radius explosion
- **Flavor:** *"These decorations pack a punch. Handle with care."*

#### ⚡ Light String Whip
- **Cost:** 800 NP
- **Type:** Electric Chain
- **Damage:** 15 per hit, chains to 3 enemies
- **Fire Rate:** 0.3s
- **Special:** Electric arc damage
- **Flavor:** *"Deck the halls. Wreck the bots."*

#### 🍪 Gingerbread Turret
- **Cost:** 1200 NP
- **Type:** Deployable
- **Damage:** 10 per shot (auto-fire)
- **Fire Rate:** 0.15s (turret)
- **Special:** Lasts 10 seconds, max 2 turrets
- **Flavor:** *"Set it and forget it. Smart cookies."*

#### 🔔 Jingle Bell Shotgun
- **Cost:** 900 NP
- **Type:** Spread Shot
- **Damage:** 8 x 5 pellets
- **Fire Rate:** 0.6s
- **Special:** Wide spread, close range devastation
- **Flavor:** *"Ring in the new year with buckshot and bass."*

#### 🎅 Quantum Gift Box
- **Cost:** 2000 NP (Legendary)
- **Type:** Random
- **Damage:** Varies
- **Fire Rate:** Varies
- **Special:** Random weapon effect each shot (any weapon in game)
- **Flavor:** *"What's inside? Even Santa doesn't know."*

### 2. Character Skins (Cosmetic Unlocks)

#### Mecha-Santa Skins
- **Frosty Titan** (300 NP) - Blue/white ice theme
- **Crimson Commander** (500 NP) - Red/gold elite armor
- **Stealth Claus** (750 NP) - Black ops night ops

#### Cyber-Elf Skins
- **Neon Recon** (300 NP) - Pink/purple cyberpunk
- **Arctic Scout** (500 NP) - White camo
- **Shadow Runner** (750 NP) - Dark tactical gear

#### The Bumble Skins
- **Crystal Yeti** (300 NP) - Translucent ice
- **Golden Guardian** (500 NP) - Gold-plated armor
- **Void Walker** (750 NP) - Dark matter aesthetic

### 3. Permanent Upgrades (Santa's Workshop)

#### Tier 1 (100 NP each, max level 5)
- **Extra Ammo** - +10% magazine size per level
- **Quick Reload** - -5% reload time per level
- **Tough Skin** - +5 max HP per level
- **Swift Boots** - +2% movement speed per level

#### Tier 2 (250 NP each, max level 3)
- **Critical Strikes** - +3% crit chance per level (2x damage)
- **Life Steal** - +1% damage to HP per level
- **Bullet Time** - +5% slower enemy projectiles per level
- **Lucky Drops** - +10% item drop rate per level

#### Tier 3 (500 NP each, max level 2)
- **Second Chance** - Revive once per run with 50% HP
- **Christmas Miracle** - Start with full Christmas Spirit meter
- **Double Trouble** - Dual wield (second weapon slot)
- **Boss Slayer** - +25% damage to bosses per level

---

## 📊 In-Run Progression (Leveling System)

### XP System
**Earn XP:**
- Kill Grinch-Bot: 10 XP
- Kill during streak: +5 XP per streak level
- Survive 30 seconds: 25 XP
- Boss damage: 1 XP per 10 damage

**Level Up Curve:**
- Level 1 → 2: 100 XP
- Level 2 → 3: 150 XP
- Level 3 → 4: 200 XP
- +50 XP per level thereafter
- Max Level: 20

### Level-Up Choices (3 random from pool)

#### Offensive Upgrades
- **+10% Damage** - Increase all weapon damage
- **+15% Fire Rate** - Faster shooting
- **+20% Projectile Speed** - Faster bullets
- **Piercing Shots** - Bullets pierce 1 enemy
- **Explosive Rounds** - Small AOE on hit
- **Critical Boost** - +5% crit chance
- **Multishot** - Fire +1 projectile

#### Defensive Upgrades
- **+25 Max HP** - Increase health pool
- **+5% Movement Speed** - Move faster
- **Dodge Roll** - 10% dodge chance
- **Shield Regen** - Regenerate 5 HP per 10s
- **Damage Reduction** - -5% damage taken
- **Knockback Resist** - Reduced enemy knockback

#### Utility Upgrades
- **Magnet Range** - +20% pickup range
- **XP Boost** - +15% XP gain
- **Lucky Strikes** - +10% drop rate
- **Sprint Burst** - Hold SHIFT to dash (cooldown)
- **Radar** - See enemies off-screen
- **Slow Time** - 5% global enemy slowdown

#### Christmas-Themed Upgrades
- **Snowfall** - Enemies slowed by 10%
- **Jingle Bells** - +10% score multiplier
- **Festive Fury** - Deal more damage at low HP
- **Silent Night** - Reduced enemy detection range
- **Yule Log** - Fire damage over time aura
- **North Star** - Homing projectiles

### Weapon Evolution System
**Unlock at Level 10 (if requirements met):**

| Base Weapon | Evolution | Requirement | Effect |
|------------|-----------|-------------|---------|
| Coal Cannon | Mega Coal Mortar | +3 damage upgrades | Massive AOE, slower fire |
| Plasma SMG | Plasma Storm | +3 fire rate upgrades | Continuous beam |
| Star Thrower | Supernova Burst | +3 projectile upgrades | 8-way burst |
| Snowball Launcher | Blizzard Cannon | +2 freeze upgrades | Freeze all in AOE |
| Candy Cane Staff | Peppermint Tornado | +2 melee upgrades | Spinning AOE |

---

## 🎮 Gameplay Loop Integration

### Session Flow
```
1. Main Menu
   ↓
2. Santa's Workshop (spend Nice Points)
   ↓
3. Character Select (with unlocked skins)
   ↓
4. Mission Briefing
   ↓
5. Gameplay (earn XP, level up, make choices)
   ↓
6. End Screen (earn Nice Points)
   ↓
7. Back to Main Menu (with new currency)
```

### First-Time Experience
- Start with 0 Nice Points
- 3 characters, 3 base weapons
- **Tutorial prompts:**
  - "Earn Nice Points to unlock more weapons!"
  - "Level up during runs to grow stronger!"
  - "Defeat KRAMPUS-PRIME to unlock Santa's Workshop!"

### Veteran Experience (after 10+ runs)
- 7+ unlocked weapons
- 3-5 character skins
- Tier 1-2 permanent upgrades active
- **Mastery goals:**
  - "Max out all Tier 3 upgrades!"
  - "Unlock all weapon evolutions!"
  - "Beat your high score with each character!"

---

## 📈 Balance & Economy

### Nice Points Earning Rate
**Target:** 500-1000 NP per run (average)
- Casual run (loss at 5 kills): ~200 NP
- Good run (boss defeated): ~800 NP
- Perfect run (no damage, boss defeated): ~1200 NP

### Unlock Timeline
- **Run 1-2:** Unlock first weapon (500 NP)
- **Run 3-5:** Unlock first skin + Tier 1 upgrades (800 NP)
- **Run 5-10:** Unlock 2-3 more weapons (1500 NP)
- **Run 10-20:** Unlock Tier 2 upgrades, more skins (3000 NP)
- **Run 20+:** Max out Tier 3, unlock legendary weapon (5000+ NP)

### Grinding Prevention
- **Daily Bonus:** +100 NP on first run each day
- **Challenge Mode:** Rotating modifiers for +50% NP
- **Achievements:** One-time NP rewards for milestones

---

## 🛠️ Technical Implementation

### Data Structures
The meta-progression and run progress data structures are defined in `src/types/index.ts` (`MetaProgressData` and `RunProgressData`).

### Store Updates
State management is centralized in `src/store/gameStore.ts`. Actions include:
- `earnNicePoints(amount)` / `spendNicePoints(amount)`
- `unlockWeapon(id)` / `unlockSkin(id)`
- `upgradePermanent(id)`
- `gainXP(amount)`
- `levelUp()`
- `selectLevelUpgrade(id)`

### UI Components
```typescript
// New components needed
src/ui/SantasWorkshop.tsx    // Meta-progression shop
src/ui/LevelUpScreen.tsx       // In-run upgrade selection
src/ui/XPBar.tsx               // XP progress indicator
src/ui/NicePointsDisplay.tsx   // Currency display
```

---

## 🎁 Future Expansions

### Phase 2 Additions
- **Daily Challenges:** Rotating modifiers, special rewards
- **Achievements System:** 50+ achievements with NP rewards
- **Leaderboards:** Global/friends high scores
- **Character Mastery:** Unlock alt abilities per character

### Phase 3 Additions
- **Story Mode:** Narrative campaign with cutscenes
- **Boss Rush:** Fight all bosses back-to-back
- **Endless Mode:** Survive as long as possible
- **Multiplayer:** 2-player co-op

---

## ✅ Implementation Checklist

### MVP (Minimum Viable Product)
- [ ] Nice Points currency system
- [ ] Santa's Workshop UI
- [ ] 3 unlockable weapons
- [ ] 3 permanent Tier 1 upgrades
- [ ] XP and leveling system
- [ ] 10 level-up upgrade choices
- [ ] Persistent save/load system

### V1.0 (Full Launch)
- [ ] 7 unlockable weapons
- [ ] 9 character skins (3 per class)
- [ ] All Tier 1-3 permanent upgrades
- [ ] 20 level-up upgrade choices
- [ ] Weapon evolution system
- [ ] Nice Points balance tuning

### V1.1 (Polish)
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Meta-progression stats screen

---

## 📊 Success Metrics

**Target Goals:**
- **Session Length:** 10-15 minutes average
- **Replay Rate:** 3-5 runs per session
- **Progression Feel:** New unlock every 2-3 runs
- **Retention:** 50% players return next day
- **Engagement:** 80% players unlock at least 3 weapons

---

## 🎄 Conclusion

This meta-progression system transforms Protocol: Silent Night into a **deep, replayable rogue-like** that:
- ✅ Respects player time (short runs, meaningful unlocks)
- ✅ Maintains "one more run" addiction (always something to unlock)
- ✅ Offers build variety (weapons + upgrades + evolutions)
- ✅ Stays thematically festive (Christmas + cyberpunk in every system)

**Next Steps:**
1. Implement MVP (Nice Points + 3 weapons + XP system)
2. Playtest balance (earning rate, unlock pacing)
3. Expand to V1.0 (all weapons, skins, upgrades)
4. Polish & iterate based on feedback

**Let's make this the most replayable Christmas game ever.** 🎄⚡
