# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **See also:** `AGENTS.md` for comprehensive agent instructions.

## 🎯 Current Focus: 1.0 Mobile-Native

**Branch:** `release/1.0`
**Architecture:** React Native + Expo + BabylonJS (NOT web-first)

```bash
# ALWAYS check context first
cat memory-bank/activeContext.md
```

## 📚 Memory Bank (Multi-Agent Context)

The `memory-bank/` directory provides shared context for all AI agents:

| File | Purpose | Read When |
|------|---------|-----------|
| `projectbrief.md` | Project overview and goals | Starting any work |
| `productContext.md` | Product requirements | Feature work |
| `techContext.md` | Technology stack | Implementation |
| `systemPatterns.md` | Architecture patterns | Writing code |
| `activeContext.md` | **Current priorities** | Every session |
| `progress.md` | Work tracking | Continuing work |
| `codebaseSummary.md` | File structure | Navigation |

**Critical:** Always read `activeContext.md` before starting work.

## 🤖 AI Agent Commands

Delegate work to AI agents by commenting on issues or PRs:

| Command | Agent | What It Does |
|---------|-------|--------------|
| `/jules <task>` | Google Jules | Multi-file refactoring, auto-creates PR |
| `/cursor <task>` | Cursor Cloud | Long-running autonomous tasks |
| `@claude <task>` | Claude Code | Analysis, implementation, creates PR |
| `@sage <question>` | Ollama | Quick answers and explanations |

**Example:** `/jules Add comprehensive input validation to all API endpoints`

> Requires control center workflow integration. See [jbcom/control-center](https://github.com/jbcom/control-center).

---

## Quick Start

```bash
# Check current context before starting
cat memory-bank/activeContext.md

# Check for project-specific instructions
cat .github/copilot-instructions.md 2>/dev/null
```

## Development Workflow

### Before Making Changes
1. Read the issue/PR description completely
2. Check `memory-bank/` for project context
3. Look at recent commits for coding patterns
4. Run tests to ensure clean starting state

### Making Changes
1. Create a feature branch if not already on one
2. Make minimal, focused changes
3. Write/update tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed

### Committing
```bash
# Use conventional commits
git commit -m "feat(scope): add new feature"
git commit -m "fix(scope): resolve bug"
git commit -m "docs: update README"
git commit -m "test: add missing tests"
git commit -m "chore: update dependencies"
```

## Code Quality Checklist

Before considering work complete:
- [ ] All tests pass
- [ ] Linting passes
- [ ] No new warnings introduced
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format

## Project Structure

```
protocol-silent-night/
├── apps/                        # Application packages
│   ├── mobile/                  # Expo + BabylonJS React Native
│   │   ├── app/                 # Expo Router pages
│   │   └── components/          # React Native components
│   └── web/                     # [LEGACY] Maintenance mode
├── packages/
│   └── game-core/               # Shared game logic
│       ├── src/data/            # JSON DDLs (Source of Truth)
│       └── src/types/           # TypeScript definitions
├── src/                         # [LEGACY] Original web source
├── docs/                        # Documentation
│   ├── VISION_1.0.md           # 1.0 release vision
│   └── TRIAGE_REPORT_2026-01.md # GitHub triage results
├── memory-bank/                 # Multi-agent context (READ FIRST)
├── .kiro/                       # Kiro AI specifications
│   ├── specs/                   # Feature specifications
│   └── steering/                # Development guidelines
├── CLAUDE.md                    # This file
└── AGENTS.md                    # Agent registry
```

## Getting Help

1. **Start here:** `memory-bank/activeContext.md`
2. Check `AGENTS.md` for detailed agent instructions
3. Check `docs/VISION_1.0.md` for architecture decisions
4. Check `.kiro/specs/` for implementation details
5. Look at test files for usage examples

## Repository-Specific Notes

### Architecture (1.0)
- **Mobile-Native:** React Native + Expo + BabylonJS (NOT Capacitor/Cordova)
- **DDL System:** All game content in JSON files in `packages/game-core/src/data/`
- **@jbcom/strata:** DEPRECATED - Replace with procedural BabylonJS

### Key Commands
```bash
# Development
pnpm dev:mobile          # Start Expo dev server
pnpm test                # Run Jest tests

# Mobile builds
pnpm build:ios           # EAS Build for iOS
pnpm build:android       # EAS Build for Android
```

### Do Not Touch
- `apps/web/` - Legacy, maintenance mode only
- Original `src/` - Will be deprecated after migration
- Any Three.js files - Being replaced, not modified

