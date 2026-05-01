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

## 8. Environment & Configuration

- All configurable values come from **environment variables** — no hardcoding.
- Use `.env` for local development, never commit it. Always commit `.env.example`.
- Provide sensible **defaults** for non-secret config where possible.
- Document every environment variable: name, purpose, required/optional, example value.
- Separate config for `development`, `test`, and `production` environments.

---

## 9. Dependency Management

- Do not add a dependency when the standard library suffices.
- Prefer **well-maintained, widely-adopted** packages over niche alternatives.
- Pin dependency versions in lock files (`package-lock.json`, `poetry.lock`, etc.) — always commit lock files.
- Review the **size and licence** of new dependencies before adding them.
- Remove unused dependencies promptly.

---

## 10. What Claude Should NOT Do

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

## 11. When Claude Is Unsure

1. State clearly what is uncertain.
2. Propose the most reasonable approach with reasoning.
3. Ask one focused question to resolve the ambiguity.
4. Do not proceed with a guess on anything that has significant impact.

---

## 12. Extending This File

Create a **project-specific** `CLAUDE.md` (or `CLAUDE.local.md`) at the project root to override or extend these rules. Common additions:

- Language/framework conventions (e.g., `CLAUDE.python.md`, `CLAUDE.react.md`)
- Project-specific architecture decisions and constraints
- Team-specific branching model or deployment process
- Domain glossary and ubiquitous language
- Specific linting and formatting tool configurations

Project-level rules always take precedence over this base file.

---

*This file is version-controlled. Update it when team conventions evolve.*
