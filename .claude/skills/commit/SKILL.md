---
name: commit
description: Create a conventional commit for Protocol: Silent Night following project commit conventions. Stages all modified tracked files, writes a typed commit message, and runs the pre-commit test gate.
disable-model-invocation: true
user-invocable: true
---

# /commit — Protocol: Silent Night Commit Wizard

Creates a conventional commit with the correct type prefix and runs the pre-commit test gate.

## Commit Types

| Type | When to use |
|------|-------------|
| `feat` | New gameplay feature, script, scene, or content |
| `fix` | Bug fix — broken behavior corrected |
| `refactor` | Code restructuring with no behavior change |
| `test` | New or updated test files only |
| `docs` | Documentation only (.md files) |
| `chore` | Tooling, config, .uid files, dependency pins |
| `perf` | Performance improvement |

## Convention

```
type(scope): short description in lowercase

[optional body — what changed and why]
```

**Scope** should be the module area: `wave`, `coal`, `presents`, `audio`, `hud`, `board`, `enemy`, `main`, `gear`, `saves`, `polish`.

## Examples

```bash
feat(coal): add rarity scale to VFX particle burst
fix(wave): set is_boss_wave flag in generate_wave output
refactor(enemy): extract behavior_ranged into enemy_behaviors_ext
test(coal): cover RARITY_SCALE 3x burst jitter paths
docs(audio): add AUDIO_ARCHITECTURE.md reference doc
chore: commit .uid files for game-completion batch scripts
```

## Workflow

1. `git diff --staged` — show what's staged
2. Determine type + scope from changed files
3. Write message following convention above
4. `git commit -m "type(scope): message"`

The PostToolUse hook will run the test gate and block if tests fail.

## PR & Release Workflow

- **Squash merge only** — comprehensive commits per PR are fine
- Only do targeted commits for very large changesets (better AI review legibility)
- PRs target `main` (no staging branch)
- After merge, `release-please` opens a release PR that bumps version + CHANGELOG
- When release PR merges, `release.yml` builds Android APK + HTML5 and attaches to the GitHub release

## Safe git add

`.gitignore` is maintained to support `git add -A` safely. If you find untracked files that shouldn't be committed, **fix `.gitignore` — don't use targeted adds to work around it.**

```bash
# Safe batch add (always check status first)
git status --short
git add -A
git status  # verify staged files look right
```
