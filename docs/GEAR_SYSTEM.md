# Gear & Loot System

## Economy

### Dual Currency
- **XP**: In-run only. Kills/pickups grant XP. Level-ups offer upgrade cards. Resets each run.
- **Cookies (C)**: Persistent meta currency. Earned in-run, spent between matches.

### Cookie Sources
- Enemy kills: 1-3 C based on enemy type
- Level clear bonus: 10 C × level number
- Gift cache interaction: 15-30 C
- Selling unwanted scrolls/gear: variable
- Krampus kill bonus: 50 C

### Cookie Spending (Between-Match Screens)
1. **Upgrade Screen**: Permanent present stat boosts (HP, damage, speed, etc.)
2. **Market Screen**: Random 3-item gear shop, refreshes each match
3. **Reroll**: 10 C to shuffle market offerings

## Naughty & Nice Lists (Scrolls)

### Drop Pressure Accumulator
Uses the same PRNG-driven accumulator pattern as boss spawns — no fixed cadences.

- `scroll_pressure: float` — tracked per run, grows with level + PRNG + lookback
- Each special board object spawn tick rolls against scroll_pressure
- Higher difficulty tiers increase scroll_pressure growth (more risk = more reward)
- Lookback: levels without scroll drops increase future pressure
- Pressure partially resets when a scroll drops (not fully — keeps building)

### Board Object Types (Scroll Sources)
- **Frozen Mailbox**: Destructible prop, spawns via pressure roll
- **Gift Cache**: Timed event ("GIFT CACHE DETECTED"), spawns via pressure roll
- **Chimney Vent**: Interactable, spawns near arena edges via pressure roll
- **Krampus Kill**: High scroll_pressure bonus added on kill (not guaranteed, but very likely)

All board object spawns are stochastic — the player learns to feel the pressure building but can never perfectly predict when the next scroll source will appear.

### Scroll Types
- **Nice List** (60% chance): Contains gear, C bonus, or rare buff
- **Naughty List** (40% chance): Contains coal, cursed gear, or C with penalty

### Opening Flow
Scrolls collected during run. Opened on the between-match scroll screen.
Each scroll shows a brief unfurl animation, then reveals contents.

## Coal

### Acquisition
- Naughty List scroll contents
- Rare enemy drops
- Environmental (frozen coal veins on board?)

### Mechanics
- Stacks in sidebar buff queue (right edge of screen, Pickle Pete-style)
- Tap to activate: RANDOM effect from pool:
  - **Spray**: Launch coal fragments in random directions (area damage)
  - **Hurl**: Throw at nearest enemy, massive single-target damage
  - **Poison**: Self-damage over 3s (risk)
  - **Embers**: Temporary fire aura (damage nearby enemies)
  - **Backfire**: Small explosion centered on self (damages you AND nearby enemies)
  - **Fortune**: Random C bonus (5-50 C)
- Can sell for 3 C each (low value, incentivizes using over selling)

## Gear Slots

### Slot Layout (4 slots per present)
1. **Weapon Mod** — modifies primary fire behavior
2. **Wrapping Upgrade** — defensive/HP modifier
3. **Bow Accessory** — utility/passive effect
4. **Tag Charm** — special ability/proc

### Gear Rarity
| Tier | Name | Color | Drop Weight |
|------|------|-------|-------------|
| 1 | Common | White | 60% |
| 2 | Uncommon | Green | 25% |
| 3 | Rare | Blue | 10% |
| 4 | Epic | Purple | 4% |
| 5 | Legendary | Gold | 1% |

### Gear Stats
Each gear piece modifies 1-3 stats with values scaling by rarity:
- `damage_flat`: +N damage
- `damage_mult`: +N% damage
- `fire_rate_mult`: +N% fire rate
- `speed_mult`: +N% speed
- `hp_flat`: +N max HP
- `range_mult`: +N% range
- `pierce_flat`: +N pierce
- `crit_chance`: +N% crit chance (new stat)
- `cookie_bonus`: +N% cookie drop rate
- `xp_bonus`: +N% XP gain

### Gear Visual
Each gear piece is a small procedural mesh assembly attached to the present:
- **Weapon Mod**: small barrel/nozzle mesh near hands
- **Wrapping Upgrade**: pattern overlay or glow effect on body
- **Bow Accessory**: small ornament mesh on the bow
- **Tag Charm**: dangling mesh from the side

### Gear Definition Schema
```json
{
  "id": "candy_cane_barrel",
  "name": "Candy Cane Barrel",
  "slot": "weapon_mod",
  "rarity": 2,
  "stats": {"damage_flat": 5, "fire_rate_mult": 0.08},
  "visual": {"mesh_type": "cylinder", "color": "#ff2244", "stripe_color": "#ffffff"},
  "flavor": "Peppermint-powered precision"
}
```

## Between-Match Screen Flow

### Screen 1: Results
- Level reached, enemies killed, cookies earned, scrolls collected
- Time survived, difficulty tier

### Screen 2: Scroll Opening
- Display collected scrolls
- Tap each to unfurl and reveal contents
- Gear goes to inventory, C goes to wallet, coal goes to buff queue

### Screen 3: Market
- 3 random gear items for sale (prices scale with rarity)
- "REROLL" button for 10 C
- Player's current gear shown alongside for comparison
- Buy replaces equipped gear in same slot (old gear sold for half value)

### Screen 4: Upgrades (if C available)
- Permanent stat boost tracks (same as meta_upgrades concept)
- Each track has levels with increasing cost

## Procedural Generation Pipeline

### Factories Needed
1. `ScrollFactory` — generates scroll visual (QuadMesh body + CylinderMesh rolls + parchment shader)
2. `CoalFactory` — generates coal visual (rough SphereMesh + dark material + ember particles)
3. `GearFactory` — generates gear visuals from definition parameters
4. `BoardObjectFactory` — generates mailboxes, gift caches, chimney vents

### Bulk Content Generation (Haiku)
Once factories and schemas are defined:
- Generate 50+ weapon mod definitions
- Generate 50+ wrapping upgrade definitions
- Generate 50+ bow accessory definitions
- Generate 50+ tag charm definitions
- Opus reviews visual quality via screenshot batches
- Definitions stored in `declarations/gear/*.json`

## Implementation Priority
1. Cookie economy (replace XP-only drops with XP + cookies)
2. Board objects (mailbox, gift cache as scroll drop sources)
3. Scroll factory + opening animation
4. Coal mechanic (sidebar queue + tap activation)
5. Gear slot system (equip/unequip + stat application)
6. Between-match screens (results → scrolls → market → upgrades)
7. Bulk gear generation via Haiku
8. Gear visual attachment to present characters
