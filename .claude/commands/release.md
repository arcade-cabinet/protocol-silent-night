---
allowed-tools: Edit,Write,Read,Bash(git:*),Bash(gh:*),Bash(npm:*)
description: Prepare a new version release
---

# Release Command

Prepare and create a new version release.

## Process

1. **Check Current State**
   ```bash
   git log --oneline -20
   npm version
   ```

2. **Determine Version Bump**
   - Analyze changes since last release
   - **Major** (X.0.0): Breaking changes
   - **Minor** (0.X.0): New features
   - **Patch** (0.0.X): Bug fixes

3. **Update CHANGELOG.md**
   - Add new version section with date
   - Categorize changes:
     - Added
     - Changed
     - Fixed
     - Removed
   - Follow [Keep a Changelog](https://keepachangelog.com/) format

4. **Run Final Checks**
   ```bash
   npm run typecheck
   npm test
   npm run build

8. **Create GitHub Release**
   ```bash
   gh release create v<version> --generate-notes
   ```

## CHANGELOG Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features
```

---
