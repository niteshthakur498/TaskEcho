# Local CI Setup & Testing

Guide to run CI checks locally before pushing to GitHub.

---

## Overview

Before opening a PR, you can run the same checks locally to catch issues early and save time.

**Benefits:**
- ✅ Catch issues before pushing
- ✅ Fix formatting immediately
- ✅ Verify documentation completeness
- ✅ Faster iteration cycle

---

## Prerequisites

Make sure you have:
- **Git** installed
- **Node.js 18+** installed
- **npm** available
- Your code changes committed

### Check Versions
```bash
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
git --version     # Any recent version
```

---

## 1. Documentation Check (Local)

### What It Checks
For `feat/*` branches:
- ✅ Documentation file exists: `docs/features/[feature-name].md`
- ✅ File has required sections

### How to Run

#### Step 1: Determine Your Feature Name
```bash
# Get current branch name
git branch --show-current
# Output: feat/task-completion

# Extract feature name (remove feat/ prefix)
# Feature name: task-completion
```

#### Step 2: Check If Documentation File Exists
```bash
# Replace FEATURE_NAME with your feature name
ls docs/features/FEATURE_NAME.md

# Example:
ls docs/features/task-completion.md

# If file doesn't exist, you'll see:
# ls: cannot access 'docs/features/task-completion.md': No such file or directory
```

#### Step 3: Verify Required Sections
```bash
# Check for required sections in your documentation
grep "## Functional Changes" docs/features/FEATURE_NAME.md
grep "## Technical Design" docs/features/FEATURE_NAME.md
grep "## Tech Decisions" docs/features/FEATURE_NAME.md

# If all three exist, you'll see the matching lines
# If missing, command returns nothing
```

### What to Do If Check Fails

#### Missing Documentation File
```bash
# Create the documentation file
# Copy from an existing example or use template
cat docs/features/task-completion.md > docs/features/your-feature.md

# Edit the file with your feature details
```

#### Missing Sections
```bash
# Edit your documentation file
# Add the missing sections

# Recommended structure:
# - Functional Changes (what user sees)
# - Technical Design (how it works)
# - Tech Decisions (why you chose this approach)
# - Implementation Details (what changed)
# - Testing Recommendations (how to test)
# - Deployment Notes (any special setup)
```

### Script to Automate Check
```bash
#!/bin/bash
# Save as: ci/check-docs-local.sh

BRANCH=$(git branch --show-current)

if [[ $BRANCH == feat/* ]]; then
  FEATURE_NAME=$(echo $BRANCH | sed 's/feat\///')
  DOC_FILE="docs/features/$FEATURE_NAME.md"
  
  echo "📋 Checking documentation for: $FEATURE_NAME"
  
  if [ ! -f "$DOC_FILE" ]; then
    echo "❌ FAILED: Missing $DOC_FILE"
    exit 1
  fi
  
  MISSING=0
  for section in "Functional Changes" "Technical Design" "Tech Decisions"; do
    if ! grep -q "## $section" "$DOC_FILE"; then
      echo "❌ Missing section: ## $section"
      MISSING=$((MISSING+1))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    echo "✅ PASSED: Documentation is complete"
    exit 0
  else
    echo "⚠️  $MISSING sections missing"
    exit 1
  fi
else
  echo "ℹ️  Documentation check skipped (not a feature branch)"
  exit 0
fi
```

---

## 2. Formatting Check (Local)

### What It Checks
- ✅ All code in `frontend/src/` matches Prettier rules
- ✅ Consistent formatting across codebase

### How to Run

#### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

#### Step 2: Install Dependencies
```bash
npm install
# or use ci for exact versions:
npm ci
```

#### Step 3: Check Formatting
```bash
npm run format:check
```

**Output if everything is fine:**
```
✅ All files are properly formatted
```

**Output if formatting issues found:**
```
❌ Formatting issues found in:
- src/app/page.tsx
- src/components/TaskList.tsx

Run 'npm run format' to fix automatically
```

### What to Do If Check Fails

#### Option 1: Auto-Fix (Recommended)
```bash
cd frontend
npm run format
```

This automatically fixes all formatting issues based on `.prettierrc.json` rules.

#### Option 2: View Issues Without Fixing
```bash
cd frontend
npm run format:check 2>&1 | head -50
```

Shows which files have issues without modifying them.

#### Option 3: Manual Review
1. Look at the output to see which files failed
2. Open files in your editor
3. Check against `.prettierrc.json` rules:
   - Line length ≤ 100 characters
   - 2 spaces indentation (not tabs)
   - Double quotes (not single)
   - Semicolons at end of statements

---

## Quick Checklist Before Opening PR

Use this checklist to verify locally:

### For Feature Branches (`feat/*`)

- [ ] **Documentation created** — `docs/features/[feature-name].md` exists
- [ ] **Required sections added:**
  - [ ] `## Functional Changes`
  - [ ] `## Technical Design`
  - [ ] `## Tech Decisions`
- [ ] **Code is formatted** — `npm run format:check` passes
- [ ] **Changes committed** — `git status` shows clean working tree

### For All Branches

- [ ] **Code is formatted** — `npm run format:check` passes
- [ ] **Changes committed** — `git status` shows clean working tree
- [ ] **No debugging code** — Remove console.logs, test comments
- [ ] **No secrets** — No API keys, passwords, tokens

---

## Complete Workflow Example

### Scenario: Adding Task Deletion Feature

```bash
# 1. Create feature branch
git checkout -b feat/task-deletion

# 2. Make code changes
# (edit frontend/src/app/page.tsx, etc.)

# 3. Verify documentation
ls docs/features/task-deletion.md
# File doesn't exist, so create it:
cp docs/features/task-completion.md docs/features/task-deletion.md
# Edit the file with your feature details

# 4. Verify all required sections exist
grep "## Functional Changes" docs/features/task-deletion.md
grep "## Technical Design" docs/features/task-deletion.md
grep "## Tech Decisions" docs/features/task-deletion.md

# 5. Check formatting
cd frontend
npm install
npm run format:check

# 6. If formatting failed, fix it
npm run format

# 7. Verify formatting now passes
npm run format:check

# 8. Commit all changes
git add -A
git commit -m "feat(tasks): add task deletion feature

- Add delete button to completed tasks
- Remove task from list when deleted
- Update UI to reflect deletion

See docs/features/task-deletion.md for details."

# 9. Push to GitHub
git push origin feat/task-deletion

# 10. Create PR on GitHub
# (GitHub will automatically run CI checks)
```

---

## Troubleshooting

### Issue: npm install is very slow

**Solution:** Use npm ci with cache
```bash
cd frontend
npm ci --prefer-offline
```

---

### Issue: Prettier not found

**Solution:** Make sure dependencies are installed
```bash
cd frontend
npm install prettier
# or
npm ci
```

---

### Issue: Different results locally vs GitHub

**Problem:** Local machine has different Node/npm versions

**Solution:** Use .nvmrc for consistent versions
```bash
# Install nvm (Node Version Manager)
# Then run:
nvm use 18
npm ci
```

---

### Issue: Can't run npm commands

**Solution:** Make sure you're in the right directory
```bash
# Check current directory
pwd

# Should be in /TaskEcho directory
# For frontend commands, cd to frontend/
cd frontend
npm install
```

---

## Advanced: Run All CI Checks

Create a script to run all checks at once:

```bash
#!/bin/bash
# Save as: ci/run-checks.sh

echo "🔍 Running all CI checks locally..."
echo ""

# Check documentation
echo "📋 Checking documentation..."
BRANCH=$(git branch --show-current)
if [[ $BRANCH == feat/* ]]; then
  FEATURE_NAME=$(echo $BRANCH | sed 's/feat\///')
  if [ ! -f "docs/features/$FEATURE_NAME.md" ]; then
    echo "❌ Documentation check failed"
    exit 1
  fi
  echo "✅ Documentation check passed"
else
  echo "ℹ️  Documentation check skipped (not feature branch)"
fi

echo ""

# Check formatting
echo "🎨 Checking code formatting..."
cd frontend
npm ci --prefer-offline
npm run format:check
if [ $? -eq 0 ]; then
  echo "✅ Formatting check passed"
else
  echo "❌ Formatting check failed"
  exit 1
fi

echo ""
echo "✨ All checks passed! Ready to push."
```

---

## CI in GitHub vs Local

| Check | Local | GitHub |
|-------|-------|--------|
| Documentation | Manual script | Automatic on every PR |
| Formatting | `npm run format:check` | Automatic on every PR |
| Speed | Instant (no npm install) | 2-3 min (includes install) |
| Convenience | Manual execution | Automatic |
| Error Messages | Simpler | More detailed |

---

## Best Practices

### 1. Run Checks Before Pushing
```bash
# Before: git push origin ...
# Run: npm run format:check (and documentation check)
# This saves CI minutes and speeds up your feedback loop
```

### 2. Commit After Formatting Fix
```bash
# If npm run format modified files:
git add frontend/src
git commit -m "style: auto-format code with prettier"
git push origin feat/...
```

### 3. Keep Checks Separate from Feature Commits
```bash
# Good:
# Commit 1: feat(tasks): implement deletion feature
# Commit 2: style: auto-format code with prettier

# Avoid:
# Commit 1: feat(tasks): implement deletion and fix formatting
```

---

## Links

| Resource | Purpose |
|----------|---------|
| [README.md](./README.md) | CI overview and FAQ |
| [WORKFLOWS.md](./WORKFLOWS.md) | Detailed workflow specs |
| [../.prettierrc.json](../.prettierrc.json) | Prettier configuration |
| [../CLAUDE.md](../CLAUDE.md) | Project development standards |

---

## Quick Reference

```bash
# Documentation Check
ls docs/features/[feature-name].md
grep "## Functional Changes" docs/features/[feature-name].md

# Formatting Check
cd frontend
npm install                # One time setup
npm run format:check       # Check formatting
npm run format             # Auto-fix formatting

# Verify Before Push
npm run format:check && echo "✅ Ready to push!"
```

---

**Last Updated:** May 2026  
**Status:** Active  
**Questions?** See [README.md](./README.md)
