---
name: wave-sim
description: Simulate the wave formula for Protocol: Silent Night to preview enemy composition, boss pressure, countdown, and scroll pressure at any level/seed/difficulty. Use when designing encounters or validating formula balance.
user-invocable: true
---

# /wave-sim — Wave Formula Simulator

Runs `WaveFormula.generate_wave()` in headless Godot and prints a human-readable table.

## Usage

```
/wave-sim [seed] [level] [difficulty]
/wave-sim                    # defaults: seed=42, levels 1-15, difficulty=1
/wave-sim 99999 25 4         # seed=99999, level=25, difficulty=4 (Naughty)
/wave-sim --sweep            # simulate levels 1-50 across all 6 difficulty tiers
```

## Output Format

```
Seed: 42 | Level: 10 | Difficulty: 3 (Good)
─────────────────────────────────────────────
countdown:      87s
spawn_interval: 0.31s  (3.2 enemies/sec)
composition:    [grunt x4, rusher x3, elf x2, santa x1]
hp_scale:       2.41x
speed_mult:     1.89x
pattern:        flanking
boss_pressure:  0.61  (boss likely by ~55s)
max_bosses:     1
scroll_pressure: 0.34 (scroll spawn likely by ~60s)
```

## Implementation

The skill runs a GDScript snippet via `godot --headless --path . --script` that:
1. Loads `WaveFormula` + `ScrollFormula`
2. Calls `generate_wave(seed, level, [], difficulty)` 
3. Prints the result as formatted text to stdout

```bash
cd /Users/jbogaty/src/arcade-cabinet/protocol-silent-night
godot --headless --path . -s /dev/stdin <<'GDS'
extends SceneTree
const WF = preload("res://scripts/wave_formula.gd")
const SF = preload("res://scripts/scroll_formula.gd")
func _init():
    var w = WF.generate_wave(42, 10, [], 3)
    for k in w: print(k, ": ", w[k])
    quit()
GDS
```
