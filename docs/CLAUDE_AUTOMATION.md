# 🤖 Claude Code Automation

This document describes the comprehensive Claude Code automation integrated into Protocol: Silent Night.

## Workflows

### Interactive (`@claude` mentions)

Mention `@claude` in any issue or PR comment to get AI assistance.

**Examples:**
- `@claude fix the spawn rate bug`
- `@claude add tests for the weapon system`
- `@claude optimize the particle rendering`

### Automatic PR Review

Every PR automatically receives a code review covering:
- Code quality
- Performance (game loop, canvas rendering)
- Testing coverage
- Game balance implications

### Issue Triage

New issues are automatically:
- Analyzed for content
- Labeled by type (bug, enhancement, etc.)
- Labeled by area (gameplay, ui, audio, etc.)
- Prioritized (P1, P2, P3)

### Issue Deduplication

New issues are checked against existing issues to find duplicates.

### CI Auto-Fix

When CI fails on a PR:
1. Error logs are analyzed
2. Claude attempts to fix the issue
3. Fix is committed to the PR
4. Comment explains what was fixed

### Flaky Test Detection

CI failures are analyzed to detect flaky tests:
- Timeout errors
- Race conditions
- Network issues

### Weekly Maintenance

Every Sunday at midnight:
- Dependency audit
- TODO/FIXME scan
- Test health check
- Issue hygiene report

## Custom Commands

### `/fix-issue <number>`
Analyze and fix a GitHub issue.

### `/commit`
Create well-formatted commits with conventional messages.

### `/create-pr`
Create a branch and pull request with proper formatting.

### `/release`
Prepare a new version release with CHANGELOG.

### `/optimize <file-or-pattern>`
Analyze code for performance optimizations.

## Specialized Agents

### game-balance-reviewer
Reviews changes for game balance implications:
- Damage numbers
- Enemy stats
- Economy (XP, Nice Points)
- Difficulty curve

### canvas-reviewer
Reviews Canvas 2D rendering code:
- Context state management
- Draw call batching
- Memory allocations
- Off-screen canvas usage

## Manual Triggers

Go to Actions → Claude Code → Run workflow:

- **maintenance**: Weekly health check
- **security-audit**: Deep security review
- **dependency-update**: Safe dependency updates

## Configuration

### `.claude/settings.json`
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{ "type": "command", "command": "npx prettier --write {{filepath}}" }]
      }
    ]
  }
}
```

Auto-formats files after Claude edits.

## Security

- Interactive mode restricted to repo collaborators
- Workflows use minimal required permissions
- Auto-fix commits go to PR branches only
- Secrets are never logged or exposed
