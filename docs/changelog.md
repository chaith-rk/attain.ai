# attain.ai — Changelog

All notable changes to this project are documented here.

Format: [YYYY-MM-DD] Category: Description

---

## [2026-01-03] Fix: Backfill Yesterday in Goal Days

Ensures the table always starts with yesterday by creating missing goal_day rows when fetching.

### Changed
- **`lib/supabase/queries.ts`**: On fetch, create missing dates for yesterday through next 5 days.

---

## [2026-01-03] Fix: Show Confirm Card When Tool Calls Are Missing

Added a fallback parser that derives pending intent updates from the assistant response text when the tool call is missing.

### Changed
- **`app/api/chat/route.ts`**: Parse confirmation phrasing and attach intent update payloads for the UI card.

---

## [2026-01-03] Fix: Goal Days Start at Yesterday

Adjusted goal-day generation to include yesterday, today, and the next five days.

### Changed
- **`lib/supabase/queries.ts`**: Generate 7 days starting from yesterday instead of today.

---

## [2026-01-03] Fix: Build Type Safety for Intent Payload

Resolved a TypeScript error by typing the intent-update payload explicitly in the chat API.

### Changed
- **`app/api/chat/route.ts`**: Typed pending intent payload as `IntentUpdatePayload` to satisfy the build.

---

## [2026-01-03] Phase 4 Complete: LLM → Intent (Today/Tomorrow)

Enabled LLM to update the table's intent column when users say what they plan to do today or tomorrow.

### Changed
- **`app/app/page.tsx`**: Added goal_days refetch after streaming completes
  - Previously only refetched messages, now also refetches goal_days
  - Ensures table updates are visible after LLM modifies intent via function calling
  - Updated dependency array to include `setGoalDays`

### How It Works
1. User sends message: "I'll run today"
2. API route executes `update_intent` function call during streaming
3. Database updated with new intent
4. UI refetches both messages and goal_days
5. Table displays updated intent immediately

### Already Implemented (from Phase 3)
- `lib/openai/tools.ts`: `update_intent` tool with `date: "today" | "tomorrow"` and `intent: string`
- `app/api/chat/route.ts`: Function call parsing and execution
  - Resolves "today"/"tomorrow" to actual ISO dates
  - Creates goal_day if it doesn't exist, updates if it does
  - Validates and sanitizes input server-side
- `lib/prompts/coaching.ts`: System prompt includes next 7 days context and update_intent usage instructions

### Test Cases (Passing)
- ✅ "I'll go for a run" → today's intent updated
- ✅ "Tomorrow I want to read" → tomorrow's intent updated
- ✅ "I'll run today and tomorrow" → both days updated
- ✅ Table displays changes immediately after LLM response
- ✅ No crashes on errors or malformed input

### Technical Notes
- Intent updates are atomic: either the whole transaction succeeds or it doesn't
- LLM confirms updates in natural language: "Got it! I've updated today with 'Run'"
- Function calling uses strict mode for better parameter validation
- Phase 4 was mostly complete from Phase 3 implementation - only missing table refetch

---

## [2026-01-03] Enhancement: Confirm Cards + Session Timezone

Intent updates now require explicit confirmation, and date handling respects the user's current session timezone.

### Changed
- **`components/IntentConfirmCard.tsx`**: Added a compact confirmation card UI with intent/date summary and confirmed state
- **`components/MessageBubble.tsx`**: Renders confirmation cards and confirmed states for pending updates
- **`app/api/confirm-intent/route.ts`**: Applies updates only after user confirmation
- **`app/api/chat/route.ts`**: Attaches pending intent updates and answers date questions using session timezone
- **`app/app/page.tsx`**: Sends client timezone with each chat request

### Why
- Prevent accidental table changes by requiring explicit confirmation
- Fix "today" responses near midnight by using the user's active timezone


## [2026-01-03] Refactor: Migrate from Chat Completions to Responses API

Migrated OpenAI integration from Chat Completions API to the newer Responses API for improved performance and cost efficiency.

### Changed
- **`app/api/chat/route.ts`**: Refactored to use `openai.responses.create()` instead of `openai.chat.completions.create()`
  - System message → `instructions` parameter
  - Messages array → `input` parameter with `ResponseInputItem[]`
  - Streaming events: `response.output_text.delta` for text, `response.output_item.done` for function calls
- **`lib/openai/tools.ts`**: Updated tool type from `ChatCompletionTool` to `FunctionTool`
  - Flattened structure: `function.name` → `name`, `function.parameters` → `parameters`
  - Added `strict: true` for better parameter validation
  - **Required:** `additionalProperties: false` in parameters schema (API rejects without it)

### Benefits
- **Lower costs**: 40-80% better cache utilization according to OpenAI benchmarks
- **Future-proof**: Better support for reasoning models (GPT-5, o-series)
- **Built-in tools ready**: Can easily add web_search, file_search, code_interpreter
- **Stateful option**: Can use `store: true` for server-side conversation state (not enabled yet)

### Technical Notes
- Endpoint changed from `/v1/chat/completions` to `/v1/responses`
- Same model: `gpt-4o-mini`
- Build verified: No TypeScript errors
- Runtime: Edge (unchanged)

### Migration Guide Reference
- https://platform.openai.com/docs/guides/migrate-to-responses

---

## [2026-01-03] Phase 3 Testing Complete: Chat + LLM Verified

Successfully completed end-to-end testing of Phase 3 with OpenAI API integration.

### Tested
- ✅ Message streaming works - LLM responses appear word-by-word
- ✅ Message persistence verified - chat history preserved across page refreshes
- ✅ Goal context awareness confirmed - LLM correctly references goal title/description
- ✅ Chat responsiveness validated - smooth, fast interactions with no UI lag

### Changed
- Phase 3 status updated from 🟡 (in progress) to ✅ (complete)
- All exit criteria marked as complete in docs/progress.md
- Overall progress: 4/10 phases complete (was 3/10)

### Technical Validation
- OpenAI API key configured and working in .env.local
- GPT-4o-mini streaming response functional
- Messages saving correctly to Supabase
- System prompt successfully injecting goal context
- Function calling tools available (update_intent schema ready for Phase 4)

### Next Steps
- Ready to begin Phase 4: LLM → Intent (today/tomorrow)
- First function calling implementation: update_intent tool
- Enable LLM to modify table data based on conversation

---

## [2026-01-03] Docs: Updated Phase 3 Status to Reflect Testing Gap

Corrected progress documentation to accurately reflect Phase 3 implementation status.

### Changed
- Phase 3 status changed from ✅ complete to 🟡 in progress
- Exit criteria unmarked (pending testing)
- Added note: "Code complete, pending end-to-end testing with OpenAI API key"
- Updated progress summary: 3/10 phases complete (was 4/10)

### Why
- Phase 3 code is implemented but has not been tested end-to-end
- Cannot verify chat functionality without OpenAI API key setup
- Following project standards: "mark tasks as ✅ complete only when fully done"
- Maintains accurate project status for future development

### Next Steps
- Set up OpenAI API key in .env.local
- Test chat streaming, message persistence, LLM goal context
- Mark Phase 3 complete after successful testing

---

## [2026-01-03] Docs: Enhanced CLAUDE.md with Architecture Guide

Improved CLAUDE.md to help future AI assistants be productive quickly in the codebase.

### Added
- Development commands section (npm run dev, build, lint)
- Architecture overview with data flow pattern
- State management architecture (goal-scoped state pattern)
- Supabase client pattern (browser vs server usage)
- LLM streaming flow (5-step summary)
- Common patterns (adding queries, shadcn components, OpenAI tools)
- Key files reference table

### Changed
- Trimmed documentation from verbose to essential patterns only
- Focused on "what you need to know to not break things"
- Condensed documentation standards to core principles

### Why
- AI assistants need quick-start architecture context that spans multiple files
- Original CLAUDE.md was comprehensive on workflow but lacked architectural patterns
- Reduced from 296 to 178 lines while adding critical architecture insights
- Helps future Claude instances understand data flow without reading 50+ files

---

## [2026-01-01] Docs: Enhanced OpenAI API Setup Instructions

Improved README documentation to clarify OpenAI Platform API setup requirements.

### Changed
- Updated Prerequisites section to explicitly mention "OpenAI Platform account with billing enabled"
- Added dedicated "Set Up OpenAI API" section (step 3) with complete instructions
- Clarified difference between ChatGPT (web interface) and OpenAI Platform API
- Added direct links to OpenAI Platform signup, billing, and API keys pages
- Included cost information (GPT-4o-mini pricing)
- Added "Where to get each value" guide for environment variables
- Renumbered subsequent setup steps (4-6)

### Why
- Original documentation mentioned "An OpenAI API key" in prerequisites but didn't explain how to obtain it
- No mention of billing requirement or cost expectations
- Users might confuse ChatGPT (chat.openai.com) with OpenAI Platform API (platform.openai.com)
- Missing this setup step blocks Phase 3 chat functionality

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
