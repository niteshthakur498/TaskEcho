# GitHub Actions Workflows

Detailed specifications for all CI/CD workflows in TaskEcho.

---

## 1. Check Documentation Workflow

**File:** `.github/workflows/check-documentation.yml`

### Overview
Validates that feature branches include proper documentation in `docs/features/`.

### Trigger
- When a PR is opened
- When a PR is updated (new commits pushed)
- **Only runs for feature branches** (`feat/*`)

### Steps

#### Step 1: Checkout Code
```yaml
uses: actions/checkout@v3
```
Downloads the repository code into the workflow environment.

---

#### Step 2: Extract Feature Name
```bash
BRANCH_NAME=${{ github.head_ref }}

# Extract feature name from branch
# Example: feat/task-completion → task-completion
if [[ $BRANCH_NAME == feat/* ]]; then
  FEATURE_NAME=$(echo $BRANCH_NAME | sed 's/feat\///')
```

**What it does:**
- Gets the branch name (e.g., `feat/task-completion`)
- Removes the `feat/` prefix
- Stores feature name for use in later steps

---

#### Step 3: Check Documentation File Exists
```bash
DOC_FILE="docs/features/$FEATURE_NAME.md"

if [ ! -f "$DOC_FILE" ]; then
  echo "❌ FAILED: Documentation file is missing!"
  echo "📝 Please create: $DOC_FILE"
  exit 1
fi
```

**What it does:**
- Checks if documentation file exists
- If missing, fails with helpful message
- Tells developer exactly what to create

**Example:**
- Branch: `feat/task-completion`
- Feature name: `task-completion`
- Expected file: `docs/features/task-completion.md`

---

#### Step 4: Validate Documentation Structure
```bash
# Check for required sections
grep -q "## Functional Changes" "$DOC_FILE" || MISSING+=("Functional Changes")
grep -q "## Technical Design" "$DOC_FILE" || MISSING+=("Technical Design")
grep -q "## Tech Decisions" "$DOC_FILE" || MISSING+=("Tech Decisions")
```

**What it does:**
- Searches for required section headers
- If sections missing, reports what's missing
- Provides guidance on what to add

**Required sections:**
- `## Functional Changes`
- `## Technical Design`
- `## Tech Decisions`

---

#### Step 5: Skip for Non-Feature Branches
```bash
if [[ $BRANCH_NAME != feat/* ]]; then
  echo "ℹ️  Documentation check skipped"
  echo "ℹ️  Checks only apply to feature branches (feat/*)"
fi
```

**What it does:**
- For branches like `fix/`, `docs/`, `chore/`, etc.
- Documentation check is skipped (not required)
- Only feature branches need documentation

---

### Pass/Fail Criteria

#### ✅ PASS
- Branch is `feat/*` AND
  - Documentation file exists AND
  - Has all required sections

- OR branch is not `feat/*` (skip)

#### ❌ FAIL
- Branch is `feat/*` AND
  - Documentation file is missing OR
  - Required sections are missing

---

### What Happens on Failure

**In GitHub PR:**
1. Red ❌ check mark appears
2. Check shows "Check Documentation" failed
3. Click "Details" to see error message
4. Shows exactly what's missing

**Developer action:**
1. Create/update documentation file
2. Add required sections
3. Commit and push
4. Workflow automatically re-runs
5. Check passes when file/sections exist

---

### Example Scenarios

#### Scenario 1: Missing Documentation File
```
Branch: feat/user-authentication
Expected file: docs/features/user-authentication.md
Status: ❌ FAIL

Message:
❌ FAILED: Documentation file is missing!
📝 Please create: docs/features/user-authentication.md
```

**Fix:** Create the file and push

---

#### Scenario 2: Missing Sections
```
Branch: feat/task-deletion
File: docs/features/task-deletion.md
Existing sections: [Functional Changes]
Missing sections: [Technical Design, Tech Decisions]
Status: ⚠️  WARNING

Message:
Missing expected sections:
- Technical Design
- Tech Decisions

While not blocking, these help reviewers understand your decisions.
```

**Fix:** Add the sections and push

---

#### Scenario 3: Non-Feature Branch
```
Branch: fix/null-pointer-exception
Status: ⓘ SKIPPED

Message:
ℹ️  Documentation check skipped for branch: fix/null-pointer-exception
ℹ️  Documentation checks only apply to feature branches (feat/*)
```

**No action needed:** Documentation check doesn't apply to fix branches

---

## 2. Check Formatting Workflow

**File:** `.github/workflows/check-formatting.yml`

### Overview
Validates that all code follows consistent formatting rules using Prettier.

### Trigger
- When a PR is opened
- When a PR is updated (new commits pushed)
- **Runs for all PRs** on all branches

### Steps

#### Step 1: Checkout Code
```yaml
uses: actions/checkout@v3
```
Downloads the repository code.

---

#### Step 2: Setup Node.js
```yaml
uses: actions/setup-node@v3
with:
  node-version: '18'
  cache: 'npm'
  cache-dependency-path: 'frontend/package-lock.json'
```

**What it does:**
- Installs Node.js v18
- Caches npm dependencies for faster runs
- Prevents re-downloading same packages

---

#### Step 3: Check Frontend Formatting
```bash
cd frontend
npm ci --prefer-offline --no-audit
npx prettier --check src
```

**What it does:**
1. Enters frontend directory
2. Installs dependencies (from package-lock.json)
3. Runs Prettier check on `src/` directory
4. Reports any formatting issues

**Prettier checks:**
- Line length (max 100 characters)
- Indentation (2 spaces, not tabs)
- Quotes (double quotes, not single)
- Semicolons (required)
- Trailing commas (where appropriate)
- Spacing around brackets/operators

---

### Pass/Fail Criteria

#### ✅ PASS
- All code in `frontend/src/` matches Prettier rules
- No formatting issues found

#### ❌ FAIL
- Code doesn't match Prettier formatting
- Shows files and specific issues

---

### What Happens on Failure

**In GitHub PR:**
1. Red ❌ check mark appears
2. Check shows "Check Code Formatting" failed
3. Click "Details" to see which files failed
4. Shows specific formatting issues

**Developer action:**
1. Run `npm run format` in frontend directory
2. This auto-fixes all formatting issues
3. Commit the formatted code
4. Push changes
5. Workflow automatically re-runs
6. Check passes when formatting matches

---

### Configuration

**`.prettierrc.json`** — Prettier settings
```json
{
  "semi": true,                  // Semicolons required
  "singleQuote": false,          // Use double quotes
  "printWidth": 100,             // Max 100 chars per line
  "tabWidth": 2,                 // 2 spaces indentation
  "useTabs": false,              // Spaces, not tabs
  "trailingComma": "es5",        // Trailing commas where valid
  "arrowParens": "always",       // Always use parens in arrows
  "bracketSpacing": true,        // Spaces in object literals
  "endOfLine": "lf"              // Unix line endings
}
```

---

### Example Scenarios

#### Scenario 1: Long Lines
```typescript
// Before (fails check)
const longVariableName = someFunction(parameter1, parameter2, parameter3, parameter4);

// After (passes check)
const longVariableName = someFunction(
  parameter1,
  parameter2,
  parameter3,
  parameter4
);
```

**Fix:** Run `npm run format`

---

#### Scenario 2: Quote Issues
```typescript
// Before (fails check)
const message = 'Hello World';
const path = '/api/users';

// After (passes check)
const message = "Hello World";
const path = "/api/users";
```

**Fix:** Run `npm run format`

---

#### Scenario 3: Indentation
```typescript
// Before (fails check)
function test() {
    const x = 5;  // 4 spaces
      const y = 10;  // Inconsistent
}

// After (passes check)
function test() {
  const x = 5;  // 2 spaces
  const y = 10;  // Consistent
}
```

**Fix:** Run `npm run format`

---

## How to Fix Formatting Issues

### Option 1: Auto-Fix (Recommended)
```bash
cd frontend
npm run format
```

This automatically fixes all formatting issues.

### Option 2: Check Before Fixing
```bash
cd frontend
npm run format:check
```

This shows which files have formatting issues without fixing them.

### Option 3: Manual Fix
- Edit files based on error messages
- Follow `.prettierrc.json` rules
- Usually easier to just run `npm run format`

---

## Workflow Execution Timeline

### When You Open a PR
1. GitHub Actions is triggered automatically
2. Workflows start within seconds
3. Both workflows run in parallel:
   - **Documentation check:** 10-30 seconds
   - **Formatting check:** 2-3 minutes (includes npm install)

### Total Time
Usually **2-3 minutes** for all checks to complete

### What You See
- Yellow 🟡 status initially (running)
- Green ✅ when checks pass
- Red ❌ when checks fail

---

## Troubleshooting

### Workflow Takes Too Long
**Issue:** Formatting check takes 3+ minutes

**Reason:** First run installs all npm dependencies

**Solution:**
- Subsequent PR runs are faster (caching)
- Wait for the initial run to complete
- CI caching improves with each run

---

### Check Keeps Failing
**Issue:** You fix the issue but check still fails

**Reason:** Workflow may not have re-run yet

**Solution:**
1. Wait 1-2 minutes for automatic re-run
2. Or push an empty commit: `git commit --allow-empty -m "Trigger CI"`
3. Or close and re-open the PR

---

### Inconsistent Results Locally
**Issue:** Code passes locally but fails in CI

**Reason:** Different versions or Prettier installed

**Solution:**
```bash
cd frontend
npm ci                    # Install exact versions
npm run format:check      # Check formatting
npm run format            # Auto-fix
```

---

## For Maintainers

### Modifying Workflows

**Documentation Workflow:**
- Update `.github/workflows/check-documentation.yml`
- Change required section names in check-documentation.yml
- Update ci/WORKFLOWS.md with changes

**Formatting Workflow:**
- Update `.prettierrc.json` to change formatting rules
- Update `.github/workflows/check-formatting.yml` if needed
- Document changes in ci/WORKFLOWS.md

### Testing Changes
1. Create a test branch
2. Modify workflow file
3. Create a PR
4. Verify workflow runs with new logic
5. Merge when working correctly

---

## Summary Table

| Workflow | File | Trigger | Duration | Blocks Merge? |
|----------|------|---------|----------|---------------|
| Documentation Check | `.github/workflows/check-documentation.yml` | feat/* branches | 10-30s | Yes |
| Formatting Check | `.github/workflows/check-formatting.yml` | All PRs | 2-3 min | Yes |

---

**Last Updated:** May 2026  
**Status:** Active  
**Questions?** See [README.md](./README.md)
