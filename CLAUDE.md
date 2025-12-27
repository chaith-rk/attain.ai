# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

attain.ai is a goal achievement app with an LLM chat interface and structured table view. Users create up to 3 goals, plan daily intents through conversation, and track actions over time.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Supabase, OpenAI GPT-4o-mini, Vercel

## Key Documents

| Document | Purpose | When to Update |
|----------|---------|----------------|
| `docs/prd.md` | Product requirements, data model, tech stack | When requirements change |
| `docs/progress.md` | Phased implementation plan with tasks | After completing tasks |
| `docs/changelog.md` | History of all changes | After every significant change |

## Phase-Based Development

**Before starting each phase, run a thorough review:**

1. **Re-read the PRD** — Understand what's being built and why
2. **Review the phase tasks** in `docs/progress.md` — Know every task in the phase
3. **Ask clarifying questions** — Surface ambiguities before writing code
4. **Identify dependencies** — What from previous phases does this build on?
5. **Check for blockers** — Are there unknowns that need resolution?

**During each phase:**
- Mark tasks as 🟡 in_progress when starting
- Mark tasks as ✅ complete only when fully done
- Update docs as you go, not at the end

**After completing each phase:**
- Update `docs/progress.md` with phase status
- Add changelog entry summarizing the phase
- Commit with clear message: `feat(phase-N): complete [phase name]`

## Commit Guidelines

- **Never mention "Claude" or "AI" in commit messages** - commits should read as if written by a human developer
- Use conventional commit format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Examples: `feat(chat): add message streaming`, `fix(auth): handle session expiry`
- Keep commits atomic and focused on a single change
- Write commit messages in imperative mood: "add feature" not "added feature"

## Documentation Requirements

**Pre-Commit Checklist (mandatory before every commit):**

1. **`docs/changelog.md`** — Add entry with date, category, and clear description
2. **`docs/progress.md`** — Update task status (⬜ → 🟡 → ✅), update phase progress
3. **`docs/prd.md`** — Sync any requirement changes, schema updates, or tech decisions
4. **`README.md`** — Update if new dependencies, env vars, or setup steps added

**Documentation Standards (Staff Engineer Level):**

- Treat docs as first-class citizens — code without updated docs is incomplete
- Write docs as if onboarding a new engineer tomorrow
- Changelog entries should explain *why*, not just *what*
- Progress updates should reflect actual state — no optimistic marking
- If you touch a feature, review its docs for accuracy
- Document edge cases and known limitations discovered during implementation
- Keep architectural decisions recorded in PRD with rationale

**Code Documentation:**
- Add inline comments only for non-obvious logic or business rules
- Complex functions get a brief docstring explaining purpose and edge cases
- No commented-out code — delete it (git has history)

**When to Update Which Doc:**

| Change Type | changelog.md | progress.md | prd.md | README.md |
|-------------|--------------|-------------|--------|-----------|
| New feature | ✅ | ✅ | If spec changed | If setup changed |
| Bug fix | ✅ | ✅ if task related | If behavior clarified | — |
| Refactor | ✅ | — | If architecture changed | — |
| Dependency add | ✅ | — | If tech stack changed | ✅ |
| Config change | ✅ | — | — | ✅ |

## Code Style

- Use TypeScript strict mode - no `any` types unless absolutely necessary
- Prefer named exports over default exports
- Use descriptive variable names - avoid abbreviations
- Keep components small and focused (< 150 lines)
- Colocate related files (component + styles + tests in same folder)

## Project Structure

```
/app          # Next.js App Router pages and layouts
/components   # Reusable UI components
/lib          # Utilities, API clients, helpers
/hooks        # Custom React hooks
/stores       # Zustand stores
/types        # TypeScript type definitions
/docs         # Documentation (PRD, etc.)
```

## Database

- All database changes go through Supabase migrations
- Never bypass RLS policies - all queries should respect user ownership
- Use the existing schema in `docs/prd.md` as source of truth

## LLM Integration

- Use OpenAI GPT-4o-mini for all LLM calls
- Stream responses for chat interactions
- Always include error handling for API failures
- Keep system prompts in separate files for maintainability

## Testing

- Write tests for critical business logic
- Test LLM prompt outputs with example inputs
- Ensure auth flows are tested

## Security

- Never commit API keys or secrets
- Use environment variables for all sensitive config
- Validate all user inputs before sending to LLM
