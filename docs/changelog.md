# attain.ai — Changelog

All notable changes to this project are documented here.

Format: [YYYY-MM-DD] Category: Description

---

## [2026-01-01] Phase 3 Complete: Chat UI + Basic LLM

Implemented complete chat interface with LLM integration for conversational goal coaching.

### Added
- **Chat Components**
  - `ChatView.tsx` - Main chat container with header, messages area, and input
  - `MessageBubble.tsx` - Individual message display with user/assistant styling
  - Auto-resizing textarea for message input
  - Auto-scroll to latest message on new content
  - Loading indicator while LLM is responding

- **LLM Integration** (`app/api/chat/route.ts`)
  - Edge runtime API route for optimal performance
  - OpenAI GPT-4o-mini integration with streaming responses
  - System prompt with coaching persona (`lib/prompts/coaching.ts`)
  - Goal context injection (title, description)
  - Full conversation history sent to LLM
  - Streaming response display with real-time updates

- **Message Management**
  - Message queries in `lib/supabase/queries.ts`
  - Message state in Zustand store
  - Automatic save of user messages before API call
  - Automatic save of assistant messages after stream completes
  - Message persistence and loading per goal
  - Messages load when goal is selected

- **UI Updates**
  - Split-screen layout in GoalView (table left, chat right)
  - Chat panel fixed at 384px width
  - Empty state messaging for new chats
  - Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### Technical Details
- Using native OpenAI streaming with ReadableStream (no Vercel AI SDK dependency issues)
- Messages streamed character-by-character for responsive feel
- User sees their message immediately, assistant response streams in
- All messages persist to Supabase for conversation continuity
- Edge runtime for low-latency API responses

### Files Created/Modified
- `components/ChatView.tsx` (new)
- `components/MessageBubble.tsx` (new)
- `lib/prompts/coaching.ts` (new)
- `app/api/chat/route.ts` (new)
- `stores/useAppStore.ts` (enhanced with message state)
- `components/GoalView.tsx` (updated with split-screen layout)
- `app/app/page.tsx` (updated with message loading and sending)

### Known Limitations
- LLM is conversation-only - cannot update the table yet (coming in Phase 4)
- No message summarization yet (50+ messages will all be sent)
- No error recovery UI if OpenAI API fails

---

## [2026-01-01] Phase 2 Complete: Goal CRUD + Table + Manual Edit

Implemented complete goal management functionality with manual table editing.

### Added
- **Goal Creation Dialog** (`components/CreateGoalDialog.tsx`)
  - Form with title (required, 100 char limit) and description (optional, 500 char limit)
  - Character counters for both fields
  - Creates goal with 7 empty goal_days (today + 6 days)

- **Goal Table View** (`components/GoalTable.tsx`)
  - Displays Date, Intent, Action, Notes columns
  - Today's row highlighted with visual indicator
  - Smart date formatting (Today, Tomorrow, or "Mon, Jan 1")

- **Inline Cell Editing**
  - Click-to-edit for Intent and Action cells
  - Enter to save, Escape to cancel
  - Immediate database sync on blur

- **Delete Goal Flow** (`components/DeleteGoalDialog.tsx`)
  - Confirmation modal with warning about data loss
  - Cascades to goal_days and messages via Supabase RLS

- **Supabase Queries** (`lib/supabase/queries.ts`)
  - CRUD operations for goals and goal_days
  - Combined createGoalWithDays function for atomic creation

- **Enhanced Zustand Store** (`stores/useAppStore.ts`)
  - Goals array with loading state
  - Goal days for selected goal
  - Add/remove/update operations

### Technical Notes
- Goal days stored as local date strings (YYYY-MM-DD)
- Notes column read-only (will be LLM-generated in Phase 5)
- 3-goal limit enforced via UI (Create Goal button disabled)

### Files Created/Modified
- `components/CreateGoalDialog.tsx` (new)
- `components/DeleteGoalDialog.tsx` (new)
- `components/GoalTable.tsx` (new)
- `components/GoalView.tsx` (new)
- `components/Sidebar.tsx` (updated with loading state)
- `lib/supabase/queries.ts` (new)
- `stores/useAppStore.ts` (enhanced)
- `app/app/page.tsx` (full rewrite)
- Added shadcn components: dialog, alert-dialog, table, textarea

---

## [2026-01-01] Style: Improve sign out button visibility

Changed sign out button from ghost to outline variant for better visibility in sidebar.

---

## [2026-01-01] Phase 1 Complete: Auth + Layout Shell

Implemented authentication and the basic app shell.

### Added
- Login page (`/login`) with email/password authentication
- Signup page (`/signup`) with user profile creation
- Auth middleware protecting `/app/*` routes
- `useAuth()` hook for client-side auth state
- Sidebar component with:
  - App logo/title
  - "Create Goal" button (disabled at 3 goals)
  - Goal list placeholder
  - Sign out button
- App layout with sidebar + main content area
- Root page redirect (to `/login` or `/app` based on auth state)

### Technical Details
- Using client-side auth for better UX (instant feedback)
- User timezone captured on signup via `Intl.DateTimeFormat`
- Middleware handles route protection and redirects

### Files Created
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/app/layout.tsx`
- `app/app/page.tsx`
- `components/Sidebar.tsx`
- `hooks/useAuth.ts`
- `lib/supabase/auth.ts`
- `components/ui/button.tsx`, `input.tsx`, `label.tsx`, `card.tsx` (shadcn)

---

## [2026-01-01] Docs: Revised Roadmap with Risk-First, Vertical-Slice Approach

Complete restructuring of the implementation plan to enable iterative LLM development.

### Changed
- Revised from 10 phases (horizontal layers) to 9 phases (vertical slices)
- Moved LLM integration earlier in the roadmap (Phase 3-4 vs Phase 6-7)
- Split LLM capability into incremental phases:
  - Phase 4: Today/tomorrow only
  - Phase 5: Action + notes generation
  - Phase 6: Any date parsing
- Added manual table editing as escape hatch (Phase 2)
- Goal creation via chat now Phase 7 (was Phase 8)

### Added
- Clear exit criteria for each phase
- Test cases for LLM phases
- Risk mitigation strategies

### Why
- Original plan had LLM→table (the riskiest part) too late (Phase 7)
- Can't one-shot an LLM-to-table integration — requires iteration
- New plan: prove hard things early, expand from working base
- Each phase ships demonstrable progress
- LLM complexity grows gradually: today → tomorrow → any date

### Technical Decisions
- First LLM scope: "today" and "tomorrow" only (enum, not free dates)
- Manual editing as safety net if LLM fails
- Function calling with constrained date enum reduces hallucination risk

---

## [2025-12-27] Docs: Enhanced CLAUDE.md with Autonomous Execution Policy

Updated project instructions to enable fully autonomous development workflow.

### Changed
- Added autonomous execution policy: proceed through all phases without waiting for explicit decisions
- Emphasized immediate documentation updates (never batch, never defer)
- Added instruction to share UI mockups when completing UI features
- Specified all markdown files must be stored in `/docs` directory
- Added thinking depth selection guidance for planning sessions: "think" < "think hard" < "think harder" < "ultrathink"
- Updated phase completion workflow to automatically continue to next phase

### Why
- Enables faster development velocity by reducing decision-making friction
- Ensures documentation stays synchronized with code changes in real-time
- Provides visual feedback for UI development
- Maintains consistent file organization
- Allows for adaptive problem-solving complexity during planning

---

## [2025-12-27] Phase 0 Complete: Project Setup

Successfully completed foundational setup for attain.ai. All core dependencies installed and configured.

### Added
- Next.js 14 with TypeScript and App Router
- Tailwind CSS v3 with PostCSS configuration
- shadcn/ui component library with CSS variables theming
- Supabase client libraries (@supabase/supabase-js, @supabase/ssr)
- Supabase middleware for auth session management
- Zustand state management with initial app store
- Project folder structure: app/, components/, lib/, stores/, hooks/, types/, supabase/
- Environment variable templates (.env.local.example, .env.local)
- Database migration file with complete schema (user_profiles, goals, goal_days, messages)
- TypeScript type definitions for all data models
- Supabase setup documentation (supabase/README.md)

### Technical Decisions
- Using Tailwind CSS v3 instead of v4 for better Next.js compatibility
- Manual Next.js setup instead of create-next-app for cleaner integration with existing repo
- Supabase SSR package for seamless server/client auth handling
- Path aliases configured (@/* points to project root)

### Configuration Files
- package.json with all dependencies
- tsconfig.json with strict mode and path aliases
- tailwind.config.ts with shadcn/ui color system
- postcss.config.js for Tailwind processing
- next.config.js
- middleware.ts for Supabase auth
- components.json for shadcn/ui

### Verified
- Production build succeeds (`npm run build`)
- No TypeScript errors
- All configuration files valid

---

## [2024-12-27] PRD Review & Technical Decisions

CTO-level review of PRD before development. Clarified ambiguities and made key architectural decisions.

### Added
- `user_profiles` table for timezone and chat summaries
- Timezone handling strategy: UTC timestamps, local dates, IANA timezone strings
- Character limits: title (100), description (500), intent/action (200), notes (300), messages (2000)
- Error handling strategy with user-friendly messages and debug logging
- First-time user experience: welcome message, learn-by-doing approach
- Mobile web layout: chat-first, table behind toggle
- LLM table update A/B test plan (function calling vs structured outputs)
- Chat summarization strategy for long conversations (50+ messages)
- Goal creation edge cases: no drafts, LLM pushes back on vague answers
- Phase-based development workflow in CLAUDE.md

### Changed
- `messages.goal_id` now required (removed nullable general chat)
- Added `updated_at` to all tables with auto-update triggers
- Proactive LLM behavior: only when user sends message, therapist-friend tone
- Table display: infinite scroll (collapse old months moved to v2)

### Technical Decisions
- Launch with OpenAI function calling, A/B test structured outputs after 2 weeks
- Store 1 rolling summary per goal in JSONB for message history compression
- Use `date-fns-tz` for timezone conversions
- Error logging: structured JSON with full context for debugging

---

## [2024-12-26] Project Initialization

### Added
- Created initial project repository
- Added PRD v0 (`docs/prd.md`) with complete product requirements
- Added tech stack to PRD: Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, OpenAI GPT-4o-mini
- Created `CLAUDE.md` with project instructions
- Created `docs/progress.md` with phased implementation plan (10 phases)
- Created `docs/changelog.md` (this file)

### Technical Decisions
- Chose OpenAI GPT-4o-mini for cost-effectiveness
- Planned React Native/Expo for future mobile app (v2)

---

## Template for Future Entries

```
## [YYYY-MM-DD] Brief Title

### Added
- New features or files

### Changed
- Updates to existing functionality

### Fixed
- Bug fixes

### Removed
- Deleted features or files

### Technical Notes
- Any important technical decisions or context
```

---

## Categories Reference

| Category | Use For |
|----------|---------|
| Added | New features, files, or capabilities |
| Changed | Updates to existing features |
| Fixed | Bug fixes |
| Removed | Deleted code or features |
| Security | Security-related changes |
| Docs | Documentation updates |
| Refactor | Code restructuring without behavior change |
