# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

attain.ai is a goal achievement app with an LLM chat interface and structured table view. Users create up to 3 goals, plan daily intents through conversation, and track actions over time.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Supabase (PostgreSQL + Auth), OpenAI GPT-4o-mini, Vercel

## Key Documents

| Document | Purpose | When to Update |
|----------|---------|----------------|
| `docs/prd.md` | Product requirements, data model, tech stack | When requirements change |
| `docs/progress.md` | Phased implementation plan with tasks | After completing tasks |
| `docs/changelog.md` | History of all changes | After every significant change |

## Development Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Architecture Overview

### Data Flow Pattern

**Client Components → Zustand Store → lib/supabase/queries.ts → Supabase**

- **UI Components** render from Zustand store (`stores/useAppStore.ts`)
- **Query functions** in `lib/supabase/queries.ts` handle all DB operations
- **Main orchestrator** is `app/app/page.tsx` - loads data, handles mutations, manages streaming

### State Management

Single Zustand store with **goal-scoped state**:
- `goals[]` - All user's goals
- `selectedGoalId` - Currently selected goal
- `goalDays[]` - goal_days for selected goal only
- `messages[]` - messages for selected goal only

**Critical:** When switching goals, `goalDays` and `messages` are refetched and replaced (not merged).

### Supabase Client Pattern

**Use the correct client for your context:**

- **Client Components**: `import { createClient } from '@/lib/supabase/client'`
- **Server Components / API Routes**: `import { createClient } from '@/lib/supabase/server'`

All queries in `lib/supabase/queries.ts` use the browser client.

### LLM Streaming Flow

1. User sends message → `app/app/page.tsx::handleSendMessage()`
2. POST to `/api/chat/route.ts` with `goalId` + `message`
3. API route builds context from goal + messages + goal_days
4. OpenAI streams response back to client
5. Client updates UI in real-time, then refetches messages from DB

**Function calling:** `lib/openai/tools.ts` defines schemas. API route parses tool calls and executes them.

## Phase-Based Development

**Autonomous Execution Policy:**
- **Proceed through ALL phases autonomously** — Execute tasks continuously without waiting for explicit user decisions unless specifically required
- Default to making reasonable technical decisions based on PRD and best practices
- Only ask for clarification when there are genuinely ambiguous requirements that could lead to different product outcomes
- When in planning sessions, occasionally ask which thinking depth to use when relevant: "think" < "think hard" < "think harder" < "ultrathink"

**Before starting each phase:**
1. Re-read the PRD (`docs/prd.md`) — Understand what's being built and why
2. Review the phase tasks in `docs/progress.md` — Know every task in the phase
3. Ask clarifying questions — Surface ambiguities before writing code (only when truly necessary)
4. Identify dependencies — What from previous phases does this build on?
5. Check for blockers — Are there unknowns that need resolution?

**During each phase:**
- Mark tasks as 🟡 in_progress when starting
- Mark tasks as ✅ complete only when fully done
- **Update docs IMMEDIATELY after every change** — never batch documentation updates
- **Share UI mockups** — When completing UI features, provide a visual mockup or screenshot for review

**After completing each phase:**
- Update `docs/progress.md` with phase status
- Add changelog entry summarizing the phase
- Commit with clear message: `feat(phase-N): complete [phase name]`
- Continue to next phase automatically

## Commit Guidelines

- **Never mention "Claude", "AI", or include any co-authored-by lines** - commits should read as if written by a human developer
- **No generated-by footers or AI attribution** - keep commits clean and professional
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

**Documentation Standards:**
- **CRITICAL: Update docs IMMEDIATELY after every change** — never batch updates
- Changelog entries explain *why*, not just *what*
- Progress updates reflect actual state — no optimistic marking
- All markdown files go in `/docs` directory

**When to Update Which Doc:**

| Change Type | changelog.md | progress.md | prd.md | README.md |
|-------------|--------------|-------------|--------|-----------|
| New feature | ✅ | ✅ | If spec changed | If setup changed |
| Bug fix | ✅ | ✅ if task related | If behavior clarified | — |
| Refactor | ✅ | — | If architecture changed | — |
| Dependency add | ✅ | — | If tech stack changed | ✅ |
| Config change | ✅ | — | — | ✅ |

## Autonomy & Safety Policy

Claude may freely perform these actions without confirmation:

1. Install npm dependencies **if common & safe** (≥1K weekly downloads), pin version numbers
2. Create new files/components/hooks/utilities as needed; follow existing directory conventions
3. Run local-only commands (`npm run dev`, `npm test`, `npm run lint`, `npm run build`) to verify changes
4. Generate Supabase migration files — **show SQL for review, never apply automatically beyond local dev**
5. Update `.env.local.example` (mock values only, never real keys)
6. Format code automatically via Prettier/ESLint
7. Add or adjust TypeScript types in `/types`
8. Add minimal tests for new code or utilities

### Require confirmation for:
- File deletions, breaking API changes, altering authentication/security
- Database schema edits that could affect existing data
- Production deployment config or environment changes

**Always** explain reasoning when adding new dependencies or external APIs.
Treat environment containing `LIVE_DB_URL` or `PUBLIC_APP=true` as production — no autonomous changes allowed there.

## Code Style

- TypeScript strict mode - no `any` types unless absolutely necessary
- Prefer named exports over default exports
- Keep components small and focused (< 150 lines)

## Common Patterns

**Adding a Supabase query:**
1. Add function to `lib/supabase/queries.ts` using browser client
2. Add Zustand store state/actions if UI needs to cache it
3. Call from component

**Adding a shadcn/ui component:**
```bash
npx shadcn@latest add <component-name>
```

**Adding an OpenAI tool:**
1. Define schema in `lib/openai/tools.ts`
2. Handle tool call in `app/api/chat/route.ts`

## Key Files

- `app/app/page.tsx` - Main orchestrator (data loading, mutations, streaming)
- `stores/useAppStore.ts` - Global state
- `lib/supabase/queries.ts` - All database operations
- `app/api/chat/route.ts` - LLM streaming endpoint
- `lib/prompts/coaching.ts` - System prompt builder
- `lib/openai/tools.ts` - Function calling schemas
