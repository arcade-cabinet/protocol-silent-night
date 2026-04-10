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

## Operating Principles

- **Nothing is out of scope.** Scope is whatever tasks exist and whatever comes up. I do not decide out of scope — ever.
- **Nothing is deferred.** Work additively. Find the way.
- **Large tasks → task-batch immediately.** If completing a task would require pausing for the user to say "next step": plan it with `create-task-batch`, commit the plan docs, then invoke `task-batch` autonomously. Do not wait.
- **Context limits are not stop conditions.** Auto-compaction handles them. Work through it.

## Hard Rules

- Max 200 LOC per `.gd` file
- Do not upgrade `Gaea` or `gdUnit4` without explicit approval
- Do not use hardcoded wave tables — waves come from the formula
- Do not add the old 3-character roster back — presents are the players now
- When docs disagree with `poc.html` about game feel, `poc.html` wins
- Tests must pass before commit (hook-enforced)

## Automation Layer

### Project Agents (`.claude/agents/`)

| Agent | When to use |
|-------|-------------|
| `gdscript-reviewer` | After writing/refactoring any `.gd` file — checks LOC, Godot patterns, test coverage |
| `holidaypunk-tone` | For any player-facing content (enemy names, upgrade text, UI strings, audio cue names) |

### Project Skills (`.claude/skills/`)

| Skill | Usage |
|-------|-------|
| `/commit` | Conventional commits with correct `type(scope):` prefix |
| `/wave-sim` | Simulate wave formula at any level/seed/difficulty — useful for balance work |

### Hooks (`.claude/settings.json`)

- **PreToolUse Write\|Edit**: Warns at 195 LOC (approaching ceiling)
- **PostToolUse Write\|Edit**: Blocks commits if file exceeds 200 LOC; validates JSON in `declarations/`; validates `.tscn`/`.tres` headers
- **PostToolUse Bash (git commit)**: Runs full unit + component test suite; blocks commit on failure

### MCP Servers

No project-level `.mcp.json` — all useful MCPs (context7, assets-library, blender) are installed at user scope and available in every session.

**GitHub: never use the GitHub MCP.** It is token-intensive. Use `gh` CLI with GraphQL:
```bash
gh pr view 123 --json title,state,body,reviews
gh api graphql -f query='{ repository(owner:"arcade-cabinet",name:"protocol-silent-night") { pullRequest(number:123) { title state } } }'
```

### CI/CD (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | All PRs (no branch filter) | Godot tests, LOC check, JSON validation, smoke test |
| `cd.yml` | Push to `main` | HTML5 export → GitHub Pages |
| `release.yml` | Release published | Android debug APK + HTML5 zip → release assets |
| `release-please.yml` | Push to `main` | Automated CHANGELOG + release PR |

- All checkouts use `lfs: true` — GLB/audio assets tracked via Git LFS
- Android APK is in `release.yml` — not a separate workflow (DRY)
- `export_presets.cfg` committed to repo (CI reads it)
- Android debug keystore generated in CI via `keytool`

### Commits & Releases

- Conventional commits always: `feat(scope)` / `fix(scope)` / `refactor` / `docs` / `chore` / `perf`
- Squash-merge PRs → comprehensive commits per PR are fine; targeted commits only for huge batches
- CHANGELOG maintained by release-please after setup
- `.gitignore` supports `git add -A` safely — if it doesn't, fix `.gitignore` first

### Active Plans

| Plan file | Status |
|-----------|--------|
| `.claude/plans/production-polish.prq.md` | COMPLETE — 26/26 tasks, 198 tests |
| `.claude/plans/game-completion.prq.md` | NEXT — 17 tasks: LimboAI, zones, dead-code cleanup, mobile, docs |
