# GitHub Actions Implementation Plan

**Branch:** `feat/github-actions`  
**Objective:** Automate code quality, formatting, and documentation checks on pull requests  
**Status:** Planning

---

## 1. Overview

Implement GitHub Actions workflows to automatically validate:
- ✅ Feature documentation completeness
- ✅ Code formatting standards
- ✅ Basic coding standards & linting
- ✅ Build validation (compile without errors)
- ✅ Tests pass (if tests exist)

**Benefits:**
- Reduce manual review effort
- Catch issues before human review
- Enforce consistency across all PRs
- Block merge if critical checks fail
- Provide quick feedback to developers

---

## 2. Planned Workflows

### 2.1 Documentation Check Workflow
**File:** `.github/workflows/check-documentation.yml`

**Trigger:** On PR opened/synchronize to branches matching `feat/**`

**Checks:**
1. Verify PR branch follows naming convention (`feat/`, `fix/`, `docs/`, etc.)
2. For feature branches (`feat/**`):
   - Check if `docs/features/[feature-name].md` exists
   - Validate documentation has required sections:
     - Functional Changes
     - Technical Design
     - Tech Decisions & Rationale
     - Implementation Details
     - Testing Recommendations
     - Deployment Notes
3. Post comment on PR with results

**Implementation:**
- Use `bash` script to search for docs
- Check for required headings in markdown files
- Report missing sections with helpful message
- Set check status (pass/fail)

**Example Check:**
```bash
# Verify docs exist for feature branch
if [[ $BRANCH_NAME == feat/* ]]; then
  FEATURE_NAME=$(echo $BRANCH_NAME | sed 's/feat\///')
  if [ ! -f "docs/features/$FEATURE_NAME.md" ]; then
    echo "❌ Missing documentation: docs/features/$FEATURE_NAME.md"
    exit 1
  fi
  
  # Check for required sections
  grep -q "## Functional Changes" docs/features/$FEATURE_NAME.md
  grep -q "## Technical Design" docs/features/$FEATURE_NAME.md
  # ... etc
fi
```

---

### 2.2 Code Formatting Workflow
**File:** `.github/workflows/check-formatting.yml`

**Trigger:** On every PR

**Checks:**

#### Frontend (Next.js/TypeScript)
1. **Prettier** — Code formatting
   - Install: `npm install prettier --save-dev`
   - Config: `.prettierrc.json` (or `.prettierrc`)
   - Run: `prettier --check frontend/src`
   - Auto-fix available on demand

2. **ESLint** — JavaScript/TypeScript linting
   - Install: `npm install eslint --save-dev`
   - Config: `frontend/.eslintrc.json`
   - Run: `npm run lint` (frontend)
   - Catches unused variables, missing semicolons, etc.

#### Backend (Java/Maven)
1. **Checkstyle** — Java code style
   - Maven plugin in `pom.xml`
   - Config: `checkstyle.xml`
   - Run: `mvn checkstyle:check`
   - Validates naming conventions, whitespace, etc.

2. **SpotBugs** — Java bug detection
   - Maven plugin
   - Run: `mvn spotbugs:check`
   - Catches potential bugs early

**Implementation:**
- Install dependencies in workflow
- Run linters/formatters
- Generate reports
- Comment on PR with results
- Fail if violations found

**Example:**
```yaml
- name: Check Frontend Formatting
  run: |
    cd frontend
    npm install
    npx prettier --check src
    npm run lint
    
- name: Check Backend Formatting
  run: |
    cd backend
    mvn checkstyle:check
    mvn spotbugs:check
```

---

### 2.3 Build Validation Workflow
**File:** `.github/workflows/check-build.yml`

**Trigger:** On every PR

**Checks:**

#### Frontend Build
```yaml
- name: Build Frontend
  run: |
    cd frontend
    npm install
    npm run build
```

#### Backend Build
```yaml
- name: Build Backend
  run: |
    cd backend
    mvn clean package -DskipTests
```

**What it catches:**
- Compilation errors
- Import issues
- TypeScript type errors
- Missing dependencies

---

### 2.4 Tests Workflow (Future)
**File:** `.github/workflows/check-tests.yml`

**When we add tests:**
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm test

- name: Run Backend Tests
  run: |
    cd backend
    mvn test
```

---

## 3. Configuration Files to Create

### 3.1 Frontend Configuration

**`.prettierrc.json`** — Prettier formatting rules
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

**`frontend/.eslintrc.json`** — ESLint rules
```json
{
  "extends": [
    "next/core-web-vitals"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

**`package.json` scripts** (frontend)
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```

### 3.2 Backend Configuration

**`checkstyle.xml`** — Checkstyle rules (or use Google/Sun style)

**`pom.xml`** updates — Add plugins:
```xml
<plugins>
  <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
      <configLocation>checkstyle.xml</configLocation>
      <failOnViolation>true</failOnViolation>
    </configuration>
  </plugin>
  
  <plugin>
    <groupId>com.github.spotbugs</groupId>
    <artifactId>spotbugs-maven-plugin</artifactId>
    <version>4.7.2.0</version>
    <configuration>
      <failOnError>true</failOnError>
    </configuration>
  </plugin>
</plugins>
```

---

## 4. GitHub Actions Workflow Directory Structure

```
.github/
├── workflows/
│   ├── check-documentation.yml     ← Verify docs exist
│   ├── check-formatting.yml        ← Prettier, ESLint, Checkstyle
│   ├── check-build.yml             ← Frontend & backend build
│   ├── check-tests.yml             ← Run tests (future)
│   └── pr-requirements.yml         ← Master workflow (calls others)
└── scripts/
    └── validate-documentation.sh   ← Reusable doc validation script
```

---

## 5. PR Merge Requirements

Configure GitHub branch protection rules:

**Master branch requirements:**
- ✅ All status checks pass (all workflows)
- ✅ PR approved by at least 1 reviewer
- ✅ Branch up to date with master
- ✅ No merge commits (squash or rebase)

**Automated checks status:**
- 🔴 Documentation Check (for feat/*)
- 🔴 Formatting Check (frontend + backend)
- 🔴 Build Check (frontend + backend)
- 🔴 Tests Check (when added)

---

## 6. Implementation Phases

### Phase 1: Core Workflows (Priority: High)
- [ ] Create documentation check workflow
- [ ] Create formatting check workflow (Prettier + ESLint)
- [ ] Create build check workflow
- [ ] Add `.prettierrc.json` and `.eslintrc.json`
- [ ] Update `package.json` with lint scripts
- [ ] Test workflows locally

### Phase 2: Backend Checks (Priority: Medium)
- [ ] Add Checkstyle configuration
- [ ] Add SpotBugs plugin to pom.xml
- [ ] Create backend build validation
- [ ] Test backend workflows

### Phase 3: Advanced Features (Priority: Low)
- [ ] Code coverage reporting
- [ ] Performance benchmarks
- [ ] Security scanning (OWASP, Snyk)
- [ ] Automated PR comments with results
- [ ] Auto-fix suggestions (prettier --write)

### Phase 4: Branch Protection (Priority: High)
- [ ] Configure GitHub branch protection rules
- [ ] Set required status checks
- [ ] Require PR approval
- [ ] Require branch to be up to date

---

## 7. Benefits & Expected Outcomes

**What this solves:**
- ❌ Manually checking documentation existence → ✅ Automatic validation
- ❌ Code formatting inconsistencies → ✅ Prettier enforces style
- ❌ Linting issues spotted during review → ✅ Caught before review
- ❌ Broken builds merged → ✅ Build must pass
- ❌ Different developers, different styles → ✅ Consistent standards

**Metrics:**
- Reduce PR review time by ~30% (automated checks done first)
- Catch formatting issues in seconds vs. minutes of review
- Zero broken builds on master
- Better code quality across the board

---

## 8. Risk Mitigation

**Potential Issues:**

1. **Workflow takes too long to run**
   - Solution: Run checks in parallel
   - Set reasonable timeouts (e.g., 10 min max)

2. **False positives (legitimate code fails check)**
   - Solution: Review linter rules carefully
   - Allow overrides in specific cases with justification

3. **Documentation check is too strict**
   - Solution: Allow flexible section naming
   - Focus on presence, not perfection

4. **Breaking changes to existing PRs**
   - Solution: Apply rules only to new PRs
   - Use GitHub "Require branches to be up to date" carefully

---

## 9. Testing the Workflows

**Before merging:**
1. Create test branch with intentional issues
2. Verify each check catches the issue
3. Verify each check passes when fixed
4. Verify error messages are helpful
5. Test branch protection rules

**Test scenarios:**
- [ ] Missing documentation → Workflow fails ✓
- [ ] Bad formatting → Prettier check fails ✓
- [ ] Linting errors → ESLint fails ✓
- [ ] Build errors → Build fails ✓
- [ ] All checks pass → PR green ✓

---

## 10. Documentation for This Feature

When implementing, document in:
- **`docs/features/github-actions.md`** — Complete technical design
- **`README.md`** — Add "CI/CD" section
- **`.github/workflows/*.yml`** — Add comments in each workflow
- **Contributing guidelines** (future) — How to pass checks locally

---

## 11. Next Steps (Implementation Order)

1. ✅ Create feature branch: `feat/github-actions` (DONE)
2. ✅ Create planning document (THIS FILE)
3. [ ] Create `.github/workflows/` directory
4. [ ] Create documentation check workflow
5. [ ] Create formatting check workflow
6. [ ] Add Prettier & ESLint config
7. [ ] Create build validation workflow
8. [ ] Test all workflows
9. [ ] Add branch protection rules
10. [ ] Create feature documentation
11. [ ] Merge to master
12. [ ] Verify workflows run on next PR

---

## 12. Questions & Decisions

**Decisions needed:**
- [ ] Should we auto-fix formatting (prettier --write) or just report?
- [ ] Should all checks block merge or just some?
- [ ] Do we want code coverage reports?
- [ ] Do we want performance benchmarks?
- [ ] Which linting rules are must-have vs. nice-to-have?

**Recommendations:**
- Auto-fix formatting: YES (improves DX)
- All checks block merge: YES (ensures quality)
- Code coverage: LATER (add after tests)
- Performance: LATER (after optimization needs arise)
- Linting: Focus on correctness, not style (use Prettier for style)

---

## Summary

This plan will implement:
- 📋 **Documentation Validation** — Ensure feature branches have docs
- 🎨 **Code Formatting** — Prettier for consistent style
- ✅ **Linting** — ESLint (frontend) + Checkstyle (backend)
- 🔨 **Build Validation** — Ensure code compiles
- 🛡️ **Branch Protection** — Enforce quality standards

**Effort Estimate:** 3-4 hours for implementation + testing

**Impact:** High — Significantly improves code quality and review speed

---

**Document Status:** Planning  
**Last Updated:** May 2026  
**Next Review:** After implementation
