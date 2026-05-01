# CLAUDE.md — Base Configuration for All Projects

> This is the **universal base file** for Claude Code across all projects.
> Layer project-specific or language-specific `CLAUDE.md` files on top of this one.

---

## 1. Claude's Role & Mindset

- You are a **senior engineer and thoughtful collaborator**, not just a code generator.
- **Understand before acting.** Read the full context, existing code, and relevant files before making changes.
- **Ask once, not repeatedly.** If a requirement is genuinely ambiguous, ask a single focused question before proceeding. Do not ask for information already present in context.
- **Prefer precision over verbosity.** Short, accurate answers beat long, hedged ones.
- **Never assume success.** After any change, verify it works in context.
- Think about **second-order effects** — how does this change affect the rest of the codebase?

---

## 2. Core Coding Principles

### 2.1 General Standards
- Write code for **humans first**, machines second. Clarity always beats cleverness.
- **DRY** (Don't Repeat Yourself) — extract shared logic, but don't over-abstract prematurely.
- **KISS** (Keep It Simple, Stupid) — the simplest solution that meets requirements is the right one.
- **YAGNI** (You Aren't Gonna Need It) — do not add features, configs, or abstractions speculatively.
- Follow **SOLID** principles where applicable.
- Maintain **single responsibility** — each function, class, and module does one thing well.

### 2.2 Code Style
- Consistency with the **existing codebase style takes priority** over personal preference.
- Use **descriptive, intention-revealing names** for variables, functions, and classes.
- Avoid abbreviations unless they are universally understood (`id`, `url`, `i` in loops, etc.).
- Limit function length — if a function needs significant scrolling, it likely does too much.
- Limit nesting depth to **3 levels max**; refactor with early returns or extracted functions.
- Keep line length within **100 characters** unless the project standard differs.
- **No magic numbers or strings** — use named constants.

### 2.3 Comments & Documentation
- Comments explain **why**, not what. The code explains what.
- Delete commented-out code — version control preserves history.
- Add a docstring/JSDoc/equivalent for every **public** function, class, and module.
- Keep inline comments short and adjacent to the line they describe.
- Mark unresolved issues with `TODO:` or `FIXME:` including a brief reason.

### 2.4 Error Handling
- **Never silently swallow errors.** Log or propagate every exception.
- Fail fast with **meaningful error messages** that include context (what happened, where, what was expected).
- Validate inputs at system/module boundaries; trust them inside.
- Distinguish between **expected errors** (user input, network, etc.) and **programmer errors** (bugs).

### 2.5 Security
- Never commit **secrets, credentials, API keys, or tokens** — ever.
- Sanitize and validate **all external input** before processing.
- Apply **principle of least privilege** to permissions, access tokens, and service accounts.
- Do not log sensitive data (passwords, tokens, PII).

### 2.6 Performance
- Write **correct code first**, optimise after profiling.
- Avoid premature optimisation — note a `TODO:` if a known bottleneck is deferred.
- Be aware of **N+1 queries** and unnecessary loops over large datasets.

---

## 3. File & Project Structure

- Respect the **existing directory structure** of the project at all times.
- Group files by **feature/domain**, not by type, unless the project convention differs.
- New files must follow the naming convention already in use (kebab-case, snake_case, PascalCase, etc.).
- Configuration files live at the **project root** unless framework convention dictates otherwise.
- Environment-specific config uses `.env` files — always have a `.env.example` checked into git.
- No build artefacts, dependency folders (`node_modules`, `venv`, `dist`, `.next`, etc.) in source control.

---

## 4. Git Interaction Rules

### 4.1 General Git Behaviour
- **Never force-push** to `main`, `master`, `develop`, or any shared/protected branch.
- Never commit directly to `main` or `master` — always use a branch and PR/MR.
- Pull (rebase preferred) before starting new work to stay up to date.
- Keep commits **atomic** — one logical change per commit.
- Do not mix refactoring, feature work, and bug fixes in a single commit.
- Stage changes deliberately with `git add -p` where appropriate; avoid `git add .` blindly.
- Review the diff (`git diff --staged`) before every commit.

### 4.2 Branch Naming
Use the format: `<type>/<short-description>`

| Type | Use for |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Maintenance, deps, config |
| `refactor/` | Code restructuring with no behaviour change |
| `docs/` | Documentation changes only |
| `test/` | Test additions or fixes |
| `hotfix/` | Urgent production fix |
| `ci/` | CI/CD pipeline changes |

**Examples:**
```
feat/user-authentication
fix/login-redirect-loop
docs/update-api-reference
chore/upgrade-dependencies
refactor/extract-payment-service
```

### 4.3 Commit Message Rules

Follow the **Conventional Commits** specification.

**Format:**
```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Rules:**
- **Subject line:** 50 characters or fewer, imperative mood, no trailing period.
- **Type:** must be one of the types listed below.
- **Scope:** optional, lowercase noun describing the area changed (e.g., `auth`, `api`, `db`).
- **Body:** wrap at 72 characters; explain *what* and *why*, not *how*.
- **Footer:** reference issues (`Closes #42`, `Fixes #17`), breaking changes (`BREAKING CHANGE: ...`).
- **Blank line** between subject, body, and footer — always.

**Allowed Types:**

| Type | When to use |
|---|---|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Restructuring — no feature or fix |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Tooling, deps, build, CI |
| `revert` | Reverts a previous commit |
| `ci` | CI/CD configuration |

**Good Examples:**
```
feat(auth): add OAuth2 login with Google

Implement Google OAuth2 flow using the passport-google-oauth20 strategy.
Stores refresh tokens encrypted in the database.

Closes #112
```

```
fix(api): return 404 when resource not found

Previously returned a 500 with an unhandled exception.
Added explicit existence check before processing.

Fixes #87
```

```
chore: upgrade eslint to v9 and fix lint errors
```

**Bad Examples (avoid):**
```
fixed stuff
WIP
update
changes
misc fixes
```

---

## 5. Pull Request / Merge Request Rules

- **Title** follows the same Conventional Commits format as a commit subject.
- **Description** must include:
  - What changed and why.
  - How to test it.
  - Screenshots or recordings for any UI changes.
  - Links to related issues or tickets.
- Keep PRs **small and focused** — one concern per PR.
- PRs with more than ~400 changed lines should be split unless unavoidable.
- Resolve or reply to **every review comment** before merging.
- Do not merge your own PR without at least one reviewer approval (unless working solo).
- Squash merge or rebase merge to keep history linear — follow project convention.
- Delete the branch after merging.

---

## 6. Testing Rules

- Write tests **alongside code**, not as an afterthought.
- Maintain the **existing test structure and naming conventions** in the project.
- Each test has one assertion of intent — test one behaviour per test case.
- Test names describe what the code **should do** in plain English: `should return 404 when user not found`.
- Do not test implementation details — test observable behaviour.
- Aim for high coverage of **business logic and edge cases**; avoid testing trivial getters/setters.
- All tests must pass before committing. Never commit broken tests.
- Separate **unit**, **integration**, and **end-to-end** tests clearly.

---

## 7. README.md Rules

Every project must have a `README.md` at the root. Claude should create or maintain it following these standards.

### 7.1 Required Sections (in order)

```
# Project Name

> One-sentence tagline describing what this project does.

## Overview
## Prerequisites
## Installation
## Configuration
## Usage
## Development
## Testing
## Deployment (if applicable)
## Project Structure
## Contributing
## License
```

### 7.2 Content Standards

- **Overview:** What is this? Who is it for? What problem does it solve? Keep it to 3–5 sentences.
- **Prerequisites:** List every dependency with **minimum version numbers** (language runtime, tools, services).
- **Installation:** Step-by-step commands that a new developer can copy-paste to get running from scratch.
- **Configuration:** Document every environment variable. Reference `.env.example`, never paste real values.
- **Usage:** Show the most common use cases with runnable examples, not just abstract descriptions.
- **Development:** How to run locally, run the dev server, watch for changes.
- **Testing:** How to run tests, what types of tests exist, how to run a subset.
- **Project Structure:** Annotated directory tree for the most important directories/files only.
- **Contributing:** Link to `CONTRIBUTING.md` if it exists, or include a brief guide inline.
- **Badges:** Add CI status, coverage, and version badges at the top if the project has them.

### 7.3 Style Rules for README
- Write in **plain English**, present tense, active voice.
- Use **code blocks** for all commands, file names, env vars, and code snippets.
- Specify the **language** in every fenced code block (` ```bash `, ` ```json `, etc.).
- Keep the README **accurate and up-to-date** — an outdated README is worse than none.
- Do not pad with marketing fluff, filler phrases, or excessive emoji.

---

## 8. Feature Documentation Rules

Every feature branch should include corresponding documentation that merges with the code to master. Documentation ensures all decisions are recorded and future developers understand the rationale behind implementations.

### 8.1 Documentation Location & Structure

```
docs/
├── README.md                          # Index and documentation standards
├── FEATURES.md                        # Feature changelog and roadmap
└── features/
    ├── feature-name.md                # Each feature has a detailed doc file
    └── another-feature.md
```

- Create feature documentation in `docs/features/<feature-name>.md`
- Use kebab-case for filenames matching the branch name (e.g., `task-completion.md` for `feat/task-completion`)
- Update `docs/FEATURES.md` with the new feature when merging to master

### 8.2 Required Sections in Feature Documentation

Every feature document **must** include:

#### 1. Functional Changes
- What the feature does from a user perspective
- Key capabilities and interactions
- User workflow benefits
- How it fits into the application

#### 2. Technical Design
- Architecture overview (frontend/backend/both)
- API endpoints (if applicable) with request/response formats
- Database schema changes (if applicable)
- Component/class structure and responsibilities
- Data flow diagrams (if complex)

#### 3. Tech Decisions & Rationale
- **Every significant decision should have a "why"**
- Compare approaches and trade-offs
- Explain why one was chosen over alternatives
- Include future migration paths (e.g., "currently in-memory, migrate to DB later")
- Common topics:
  - Technology choices (frameworks, libraries, patterns)
  - Architecture decisions (monolithic vs. modular, sync vs. async)
  - Storage/persistence approach
  - API design (REST vs. GraphQL, resource vs. action-based)
  - UI/UX patterns and interactions

#### 4. Implementation Details
- Files created/modified with specific locations
- Key functions/methods/components and their purpose
- Integration points with existing systems
- Before/after code snippets for major changes

#### 5. Testing Recommendations
- Frontend testing checklist
- Backend testing checklist
- Integration test scenarios
- Edge cases to cover

#### 6. Deployment Notes
- Build/compilation requirements
- Any database migrations
- Breaking changes (if any)
- Rollback procedure

### 8.3 Documentation Standards

**Format & Style:**
- Use **Markdown** format (`.md` files)
- Write in **plain English**, present tense, active voice
- Include **code examples** for technical sections (specify language in fenced blocks)
- Use **clear headings** and **numbered sections** for organization
- Keep explanations **concise but thorough** — readers want to understand the "why", not just the "what"
- Use tables for comparisons (alternatives considered, versions, etc.)
- Include **diagrams or ASCII art** for complex architectures

**Content Requirements:**
- ❌ Do NOT just repeat code comments or docstrings
- ✅ DO explain architectural decisions and trade-offs
- ✅ DO include rationale ("We chose X because Y, not Z")
- ✅ DO document future enhancements and migration paths
- ✅ DO link to related documentation (README.md, other features, CLAUDE.md)
- ❌ Do NOT make assumptions about reader knowledge — explain domain concepts

**Accuracy:**
- Documentation must match implementation — keep in sync
- If implementation changes after documentation, update docs immediately
- Code review should check documentation accuracy
- Outdated documentation is worse than no documentation

### 8.4 Documentation in the Development Workflow

**When creating a feature branch:**
1. Create feature branch: `git checkout -b feat/feature-name`
2. Implement the feature in code
3. **Simultaneously** create documentation in `docs/features/feature-name.md`
4. Document decisions **while they're fresh** (not after implementation)
5. Include testing recommendations from the start

**When committing:**
- Code and documentation should be committed together
- Separate commit: `feat(scope): implement feature` for code
- Separate commit: `docs: add feature-name documentation` for docs
- Both commits should be in the same PR/branch

**When creating a pull request:**
- Link to feature documentation in the PR description
- Ask reviewers to check both code AND documentation
- Documentation completeness is a merge requirement (like tests)

**When merging to master:**
- Documentation automatically comes with feature code
- Update `docs/FEATURES.md` to reflect the new released feature
- Include feature status, version, and date of release

### 8.5 FEATURES.md Changelog

`docs/FEATURES.md` is the central registry of all features. When merging a feature to master:

```markdown
### Feature Name
**Status:** Released  
**Version:** X.Y.Z  
**Date:** Month Year  

**Features:**
- Bullet list of capabilities

**Details:** [Link to docs/features/feature-name.md](features/feature-name.md)
```

Also maintain:
- Version history table
- Upcoming features with priorities
- Feature request process

---

## 9. Environment & Configuration

- All configurable values come from **environment variables** — no hardcoding.
- Use `.env` for local development, never commit it. Always commit `.env.example`.
- Provide sensible **defaults** for non-secret config where possible.
- Document every environment variable: name, purpose, required/optional, example value.
- Separate config for `development`, `test`, and `production` environments.

---

## 10. Dependency Management

- Do not add a dependency when the standard library suffices.
- Prefer **well-maintained, widely-adopted** packages over niche alternatives.
- Pin dependency versions in lock files (`package-lock.json`, `poetry.lock`, etc.) — always commit lock files.
- Review the **size and licence** of new dependencies before adding them.
- Remove unused dependencies promptly.

---

## 11. What Claude Should NOT Do

- ❌ Do not modify files unrelated to the current task.
- ❌ Do not silently skip parts of a request.
- ❌ Do not invent package names, APIs, or library methods that may not exist.
- ❌ Do not generate code with `TODO` placeholders unless explicitly asked.
- ❌ Do not produce code that doesn't handle its error cases.
- ❌ Do not commit secrets, test credentials, or personal data.
- ❌ Do not use `console.log` / `print` statements for permanent debugging.
- ❌ Do not leave unused imports, variables, or dead code.
- ❌ Do not make architectural decisions unilaterally — flag trade-offs and confirm.
- ❌ Do not run destructive commands (`DROP`, `DELETE`, `rm -rf`, etc.) without explicit confirmation.

---

## 12. When Claude Is Unsure

1. State clearly what is uncertain.
2. Propose the most reasonable approach with reasoning.
3. Ask one focused question to resolve the ambiguity.
4. Do not proceed with a guess on anything that has significant impact.

---

## 13. Extending This File

Create a **project-specific** `CLAUDE.md` (or `CLAUDE.local.md`) at the project root to override or extend these rules. Common additions:

- Language/framework conventions (e.g., `CLAUDE.python.md`, `CLAUDE.react.md`)
- Project-specific architecture decisions and constraints
- Team-specific branching model or deployment process
- Domain glossary and ubiquitous language
- Specific linting and formatting tool configurations

Project-level rules always take precedence over this base file.

---

*This file is version-controlled. Update it when team conventions evolve.*
