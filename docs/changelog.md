# attain.ai — Changelog

All notable changes to this project are documented here.

Format: [YYYY-MM-DD] Category: Description

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
