# Protocol: Silent Night // Agent Notes

Read `CLAUDE.md` first. It contains the full project context, architecture, and critical rules.

## Agent Priorities

1. **Holidaypunk identity** — every choice must serve festive-industrial-menacing tone
2. **Death is the game** — difficulty formula always wins eventually; upgrades are temporary relief
3. **Present protagonists** — 25-50 anthropomorphic present variants, NOT the old Elf/Santa/Bumble roster
4. **Formula-driven waves** — PRNG-seeded generation, level as force multiplier, no hardcoded tables
5. **Board-first arena** — viewport-filling roguelike board, not scenic terrain

## Read Order

1. `CLAUDE.md` (project rules and architecture)
2. `docs/reference/poc.html` (game feel truth — open in browser)
3. `docs/NORTH_STAR.md` (product vision)
4. `docs/BOARD_GENERATION_CONTRACT.md` (arena generation)
5. `docs/DEPENDENCY_POLICY.md` (upgrade firewall)

## Hard Rules

- Max 200 LOC per `.gd` file
- Do not upgrade `Gaea` or `gdUnit4` without explicit approval
- Do not use hardcoded wave tables — waves come from the formula
- Do not add the old 3-character roster back — presents are the players now
- When docs disagree with `poc.html` about game feel, `poc.html` wins
- Tests must pass before commit (hook-enforced)
