# CI/CD Documentation

This folder contains all continuous integration (CI) configuration and documentation for TaskEcho.

## Overview

TaskEcho uses **GitHub Actions** to automatically validate pull requests before they're merged to master. This ensures code quality, consistent formatting, and proper documentation across all features.

## What is CI?

**Continuous Integration (CI)** means:
- Automated checks run on every pull request
- Code is tested and validated before merge
- Issues are caught early, before code review
- Consistent standards enforced across the codebase

## Current Workflows

We have **2 automated checks** that run on every PR:

### 1. 📋 Documentation Check
**Trigger:** Feature branches (`feat/*`)

**What it checks:**
- ✅ Feature documentation file exists (`docs/features/[feature-name].md`)
- ✅ Documentation includes required sections:
  - Functional Changes
  - Technical Design
  - Tech Decisions & Rationale

**Why it matters:**
- Every feature needs documentation explaining what it does and why
- Reviewers need context to understand decisions
- Future developers need to understand architecture

**Learn more:** [Workflows Documentation](./WORKFLOWS.md)

---

### 2. 🎨 Code Formatting Check
**Trigger:** All PRs

**What it checks:**
- ✅ Frontend code follows Prettier formatting rules
- ✅ Consistent indentation, spacing, quotes, etc.

**Why it matters:**
- Consistent formatting improves readability
- Reduces trivial review comments
- Saves time in code review

**Learn more:** [Workflows Documentation](./WORKFLOWS.md)

---

## For Developers

### Before Creating a PR

**1. Run Formatting Locally**
```bash
# Frontend formatting
cd frontend
npm run format

# Check if formatting passes
npm run format:check
```

**2. Prepare Documentation (for feature branches)**
```bash
# Create documentation file
docs/features/[your-feature-name].md

# Include required sections:
# - Functional Changes
# - Technical Design
# - Tech Decisions & Rationale
```

**Learn more:** [Local Setup Guide](./SETUP.md)

---

### When PR Fails a Check

#### Documentation Check Failed ❌
**What you'll see:**
```
❌ FAILED: Documentation file is missing!
📝 Please create: docs/features/[feature-name].md
```

**How to fix:**
1. Create the missing documentation file
2. Add the required sections
3. Commit and push
4. Check will automatically re-run

**Learn more:** [Feature Documentation Standards](../CLAUDE.md#8-feature-documentation-rules)

---

#### Formatting Check Failed ❌
**What you'll see:**
```
❌ FAILED: Code formatting issues found!
📝 To fix automatically, run:
   npm run format
```

**How to fix:**
1. Run `npm run format` in the frontend directory
2. This automatically fixes formatting issues
3. Commit and push the changes
4. Check will automatically re-run

---

## Workflow Files

All workflows are defined in `.github/workflows/`:

```
.github/workflows/
├── check-documentation.yml    ← Validates feature docs exist
└── check-formatting.yml       ← Validates code formatting
```

**View workflows:** [Detailed Workflow Documentation](./WORKFLOWS.md)

---

## Configuration Files

### Frontend Configuration

**`.prettierrc.json`** — Prettier formatting rules
- Defines code style (indentation, spacing, quotes, etc.)
- Located in repo root
- Enforced on all frontend code

**`frontend/package.json`** — npm scripts
- `npm run format` — Auto-fix formatting
- `npm run format:check` — Check without fixing

---

## How to Test Locally

```bash
# 1. Test documentation check
# Create a feature branch: feat/test-feature
# Missing docs/features/test-feature.md
# See if check would fail

# 2. Test formatting check
cd frontend
npm install
npm run format:check    # See if code passes
npm run format          # Auto-fix formatting
npm run format:check    # Verify it passes
```

**Learn more:** [Setup Guide](./SETUP.md)

---

## Future Enhancements

These checks can be extended later with:
- ✅ Build validation (ensure code compiles)
- ✅ Linting (catch potential bugs)
- ✅ Test execution (automated testing)
- ✅ Code coverage reports
- ✅ Security scanning

---

## Links & References

| Document | Purpose |
|----------|---------|
| [WORKFLOWS.md](./WORKFLOWS.md) | Detailed workflow specifications |
| [SETUP.md](./SETUP.md) | Local CI testing setup |
| [../CLAUDE.md](../CLAUDE.md) | Project development standards |
| [../docs/README.md](../docs/README.md) | Documentation standards |
| [../README.md](../README.md) | Main project README |

---

## FAQ

### Q: Why do I need documentation for features?
**A:** Documentation helps reviewers understand your decisions, helps future developers maintain the code, and ensures consistency across features.

### Q: What if I disagree with a formatting rule?
**A:** Formatting rules are defined in `.prettierrc.json`. If you want to change them, discuss with the team and update the file. For now, consistency matters more than personal preference.

### Q: Can I merge without passing checks?
**A:** No. Branch protection requires all checks to pass. This ensures code quality on master.

### Q: How long do checks take?
**A:** Usually 2-3 minutes. They run in parallel while you wait.

### Q: What if the check is wrong?
**A:** Document the specific issue in the PR comment, and a maintainer can investigate or override if necessary.

---

## Questions?

For issues with CI:
1. Check [WORKFLOWS.md](./WORKFLOWS.md) for workflow details
2. Check [SETUP.md](./SETUP.md) for local testing
3. See error message in PR check for specific issue
4. Open an issue with `ci:` label for bugs

---

**Last Updated:** May 2026  
**Status:** Active (2 workflows)  
**Next Review:** When adding more checks
