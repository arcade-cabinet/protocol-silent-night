---
allowed-tools: Bash(git:*),Bash(npm:*)
description: Create well-formatted commits with conventional messages
---

# Smart Commit

Create well-formatted commits following conventional commit standards.

## Process

1. **Pre-commit Checks** (unless `--no-verify` specified)
   - Run `npm run typecheck` for type errors
   - Run `npm test` to verify tests pass

2. **Check Staged Files**
   ```bash
   git status
   ```
   - If no files staged, stage all modified files

3. **Analyze Changes**
   ```bash
   git diff --staged
   ```
   - Review the diff to understand what's changing
   - Identify if changes should be split into multiple commits

4. **Determine Commit Type**
   - ✨ `feat`: New feature
   - 🐛 `fix`: Bug fix
   - 📝 `docs`: Documentation
   - 💄 `style`: Formatting/style
   - ♻️ `refactor`: Code refactoring
   - ⚡️ `perf`: Performance
   - ✅ `test`: Tests
   - 🔧 `chore`: Tooling/config

5. **Create Commit Message**
   - Format: `<emoji> <type>: <description>`
   - Keep first line under 72 characters
   - Use present tense, imperative mood

## Examples

Good commit messages:
- ✨ feat: add weapon evolution system
- 🐛 fix: resolve enemy spawn rate calculation
- ⚡️ perf: optimize particle rendering loop
- 📝 docs: update README with new features
- ♻️ refactor: simplify damage calculation logic

## Split Guidelines

Consider splitting if:
- Changes touch unrelated parts of codebase
- Mix of features, fixes, and refactoring
- Very large changes that would be clearer separate

---
