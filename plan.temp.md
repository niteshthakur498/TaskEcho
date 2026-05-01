# GitHub Actions Implementation Plan (Simplified)

**Branch:** `feat/github-actions`  
**Objective:** Automate basic sanity checks on pull requests  
**Status:** Planning  
**Scope:** Documentation & Formatting only (MVP)

---

## 1. Overview

Implement GitHub Actions workflows to automatically validate:
- ✅ **Feature documentation completeness** (for feature branches)
- ✅ **Code formatting standards** (Frontend + Backend)

**Benefits:**
- Catch missing documentation before review
- Enforce consistent code formatting
- Reduce manual review time for trivial issues
- Provide quick feedback to developers

---

## 2. Two Simple Workflows

### 2.1 Documentation Check Workflow
**File:** `.github/workflows/check-documentation.yml`

**Trigger:** On PR opened/synchronized

**What it checks:**
- If PR branch is `feat/*`, verify `docs/features/[feature-name].md` exists
- If file exists, check for key sections:
  - `## Functional Changes`
  - `## Technical Design`
  - `## Tech Decisions`

**How it works:**
```bash
# Extract feature name from branch (feat/task-completion → task-completion)
FEATURE_NAME=$(echo $BRANCH_NAME | sed 's/feat\///')

# Check if docs file exists
if [ ! -f "docs/features/$FEATURE_NAME.md" ]; then
  echo "❌ Documentation missing: docs/features/$FEATURE_NAME.md"
  exit 1
fi

# Check for required sections
grep -q "## Functional Changes" docs/features/$FEATURE_NAME.md
grep -q "## Technical Design" docs/features/$FEATURE_NAME.md
grep -q "## Tech Decisions" docs/features/$FEATURE_NAME.md
```

**Result:** 
- ✅ PASS if docs exist and have required sections
- ❌ FAIL if documentation is missing
- Helpful comment on PR with what's missing

---

### 2.2 Code Formatting Check Workflow
**File:** `.github/workflows/check-formatting.yml`

**Trigger:** On every PR

**Frontend Check:**
1. Install Prettier
2. Check formatting: `npx prettier --check frontend/src`
3. Report any formatting issues

**Backend Check:**
1. Install dependencies
2. Run existing Java formatting checks
3. Report any style violations

---

## 3. Files to Create/Modify

### 3.1 Frontend Configuration

**`.prettierrc.json`** — Prettier rules (new file)
```json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**`frontend/package.json`** — Add script (modify existing)
```json
{
  "scripts": {
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```

### 3.2 GitHub Actions Workflows

Create `.github/workflows/` directory with:

**`check-documentation.yml`** (30 lines)
- Runs for `feat/*` branches
- Validates doc file exists
- Checks for required sections

**`check-formatting.yml`** (40 lines)
- Frontend: Prettier check
- Backend: Existing checks
- Simple pass/fail

---

## 4. Directory Structure

```
.github/
└── workflows/
    ├── check-documentation.yml    ← New
    └── check-formatting.yml       ← New

.prettierrc.json                    ← New (Frontend)

docs/features/
├── task-completion.md             ← Already exists
└── [new-features].md              ← Future features
```

---

## 5. Simple Implementation Plan

### Step 1: Create Workflows
- [ ] Create `.github/workflows/` directory
- [ ] Create `check-documentation.yml`
- [ ] Create `check-formatting.yml`

### Step 2: Add Configuration
- [ ] Create `.prettierrc.json`
- [ ] Update `frontend/package.json` with lint script

### Step 3: Test
- [ ] Test documentation check on a feature branch
- [ ] Test formatting check with bad formatting
- [ ] Verify helpful error messages

### Step 4: Finalize
- [ ] Document in feature docs
- [ ] Merge to master
- [ ] Verify workflows run on next PR

---

## 6. What Gets Checked

### Documentation Check
✅ **Runs on:** `feat/*` branches only  
✅ **Checks:** File exists + has required sections  
✅ **Fails:** If docs missing or incomplete  

### Formatting Check
✅ **Runs on:** All PRs  
✅ **Checks:** Code formatting (Prettier)  
✅ **Fails:** If formatting doesn't match rules  

---

## 7. Benefits

- 📋 **No more missing documentation** on feature PRs
- 🎨 **Consistent formatting** across codebase
- ⏱️ **Faster reviews** (don't need to check these manually)
- 💬 **Clear feedback** when checks fail

---

## 8. Future Enhancements (Later)

Not in this phase, but can add later:
- Build validation
- Test execution
- Code coverage
- Linting (ESLint, Checkstyle)
- Branch protection rules

---

## Implementation Effort

**Estimate:** 2-3 hours  
**Complexity:** Low  
**Risk:** Very Low  

---

**Status:** Ready for implementation  
**Last Updated:** May 2026
