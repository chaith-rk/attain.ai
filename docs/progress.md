# attain.ai — Progress Tracker

This document tracks implementation using a **risk-first, vertical-slice** approach. LLM complexity grows gradually across phases.

---

## Key Decisions

- **Approach:** Vertical slices — one user journey at a time
- **Manual editing:** Yes, as escape hatch (can remove later)
- **First LLM scope:** Today + tomorrow only, expand to any date in Phase 6

---

## How to Use This Document

- **Status Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete
- Each phase has clear **Exit Criteria** — don't move on until all are checked
- Update changelog after each phase

---

## Phase Overview

| Phase | Deliverable | LLM Capability | Status |
|-------|-------------|----------------|--------|
| 0 | Project Setup | None | ✅ |
| 1 | Auth + Layout Shell | None | ✅ |
| 2 | Goal CRUD + Table + Manual Edit | None | ✅ |
| 3 | Chat UI + Basic LLM | Conversation only | ✅ |
| 4 | LLM → Intent (today/tomorrow) | Write intent | ✅ |
| 5 | LLM → Action + Notes | Write action, generate notes | ⬜ |
| 6 | LLM → Any Date | Full date parsing | ⬜ |
| 7 | Goal Creation via Chat | Structured output | ⬜ |
| 8 | Multi-Goal + Polish | Full | ⬜ |
| 9 | Deploy | Full | ⬜ |

---

## Phase 0: Project Setup ✅

Foundation is in place.

| Task | Status |
|------|--------|
| Initialize Next.js 14 with TypeScript | ✅ |
| Install Tailwind CSS + shadcn/ui | ✅ |
| Create Supabase project | ✅ |
| Set up project structure | ✅ |

**Milestone:** App runs locally ✨

---

## Phase 1: Auth + Layout Shell ✅

**Goal:** Users can sign up, log in, and see the app structure.

| Task | Status | Notes |
|------|--------|-------|
| Set up Supabase Auth | ✅ | Email + password |
| Create `/login` page | ✅ | `app/login/page.tsx` |
| Create `/signup` page | ✅ | Creates user_profile with timezone |
| Add auth middleware | ✅ | Protect `/app/*` routes |
| Create `useAuth()` hook | ✅ | Access user in components |
| Build layout with sidebar | ✅ | Logo, empty goal list, Create Goal button |
| Add logout button | ✅ | In sidebar footer |

### Exit Criteria
- [x] Can sign up with email/password
- [x] Can log in and see protected page
- [x] Can log out
- [x] Layout matches PRD structure

**Milestone:** Users can authenticate and see empty app shell ✨

---

## Phase 2: Goal CRUD + Table + Manual Edit ✅

**Goal:** User can create a goal, see it in sidebar, view/edit the table manually.

| Task | Status | Notes |
|------|--------|-------|
| Create goal form | ✅ | Title + description dialog |
| Save goal to Supabase with RLS | ✅ | Via lib/supabase/queries.ts |
| Generate 7 empty goal_days on create | ✅ | Today + 6 days |
| Display goals in sidebar | ✅ | Clickable list with loading state |
| Goal selection state | ✅ | Zustand store enhanced |
| Build table component | ✅ | Date/Intent/Action/Notes columns |
| Manual cell editing | ✅ | Click to edit, Enter/Escape/blur to save |
| Delete goal with modal | ✅ | Confirmation required |
| Enforce 3-goal limit | ✅ | Disable create button at limit |

### Exit Criteria
- [x] Can create goal with title/description
- [x] Goal appears in sidebar
- [x] Clicking goal shows its table
- [x] Can manually edit intent/action cells
- [x] Can delete goal
- [x] 3-goal limit enforced

**Milestone:** Full goal CRUD without LLM ✨

---

## Phase 3: Chat UI + Basic LLM ✅

**Goal:** Chat interface works, LLM responds conversationally (no table updates yet).

| Task | Status | Notes |
|------|--------|-------|
| Create messages table queries | ✅ | fetchMessages, createMessage in queries.ts |
| Build chat container | ✅ | ChatView component with header + messages + input |
| Message bubble component | ✅ | MessageBubble with user/assistant styles |
| Save user messages to DB | ✅ | Saved before API call |
| Create `/api/chat` route | ✅ | Edge runtime with streaming |
| Set up OpenAI client | ✅ | GPT-4o-mini, server-side only |
| Build system prompt v1 | ✅ | Coaching persona in lib/prompts/coaching.ts |
| Send goal context to LLM | ✅ | Title, description, goal_days in system prompt |
| Stream responses to UI | ✅ | Native OpenAI streaming with ReadableStream |
| Save assistant messages to DB | ✅ | Saved after stream completes |
| Auto-scroll on new messages | ✅ | useRef + useEffect in ChatView |
| Add function calling tools | ✅ | update_intent tool in lib/openai/tools.ts |

### Exit Criteria
- [x] Can send message, see streaming response
- [x] Messages persist across page refresh
- [x] LLM knows goal title/description
- [x] Chat feels responsive

**Milestone:** Working chat with LLM (conversation only) ✨

---

## Phase 4: LLM → Intent (Today/Tomorrow) ✅

**Goal:** "I'll run today" or "I'll run tomorrow" updates the intent column.

| Task | Status | Notes |
|------|--------|-------|
| Define function calling schema | ✅ | `update_intent: { date: "today" \| "tomorrow", intent: string }` (implemented in Phase 3) |
| Add goal_days context to LLM | ✅ | Next 7 days sent in system prompt (implemented in Phase 3) |
| Parse function calls from response | ✅ | Event handling in API route (implemented in Phase 3) |
| Validate date resolves correctly | ✅ | ISO date resolution for today/tomorrow (implemented in Phase 3) |
| Apply update to database | ✅ | Creates or updates goal_day (implemented in Phase 3) |
| Require user confirmation before updates | ✅ | Confirmation card before applying intent changes |
| Show confirmation feedback | ✅ | Card switches to confirmed state after apply |
| Refetch table to show change | ✅ | Added in Phase 4 |
| Handle errors gracefully | ✅ | Try/catch blocks, no UI crashes |

### Test Cases
- [x] "I'll go for a run" → today's intent updated
- [x] "Tomorrow I want to read" → tomorrow's intent updated
- [x] "I'll run today and tomorrow" → both updated
- [x] Gibberish → no update, friendly response

### Exit Criteria
- [x] 90%+ success on test cases
- [x] User sees table update after message
- [x] Errors don't crash the app

**Milestone:** First LLM → table connection works ✨

**Refinement:** Updates are now pending until the user confirms via the card UI, and timezone is sent per chat request.

---

## Phase 5: LLM → Action + Notes ⬜

**Goal:** "I did my run" updates action, LLM auto-generates notes.

| Task | Status | Notes |
|------|--------|-------|
| Add `update_action` function | ⬜ | `{ date: "today" \| "tomorrow", text }` |
| Trigger notes generation | ⬜ | After action updated |
| Notes compare intent vs action | ⬜ | Supportive tone |
| Handle partial completion | ⬜ | "I ran 2 miles instead of 3" |

### Test Cases
- [ ] "I did it" → action = "Completed", notes generated
- [ ] "I ran but only 2 miles" → action captures partial
- [ ] "I skipped today" → action = "Skipped", supportive notes

### Exit Criteria
- [ ] Action + notes flow works for today/tomorrow
- [ ] Notes are supportive, not judgmental
- [ ] Complete intent→action→notes cycle

**Milestone:** Full single-day flow works ✨

---

## Phase 6: LLM → Any Date ⬜

**Goal:** "I'll run Tuesday" works with proper date resolution.

| Task | Status | Notes |
|------|--------|-------|
| Install date-fns + date-fns-tz | ⬜ | |
| Change schema to ISO date strings | ⬜ | |
| Add user timezone to context | ⬜ | |
| LLM resolves relative dates | ⬜ | "Tuesday" → ISO date |
| Validate date, create if needed | ⬜ | |
| Handle ambiguous dates | ⬜ | "Tuesday" when today is Tuesday |
| Handle date ranges | ⬜ | "Tuesday and Thursday" |

### Test Cases
- [ ] "I'll run Tuesday" → correct Tuesday intent
- [ ] "Next Monday I'll rest" → correct date
- [ ] "Tuesday and Thursday" → both updated
- [ ] "Move Tuesday to Wednesday" → clears Tue, fills Wed

### Exit Criteria
- [ ] Relative dates work reliably
- [ ] Timezone handling correct
- [ ] Multi-day updates work

**Milestone:** Natural date language works ✨

---

## Phase 7: Goal Creation via Chat ⬜

**Goal:** Guided conversation creates goal + 7 days.

| Task | Status | Notes |
|------|--------|-------|
| Create "goal creation mode" state | ⬜ | |
| Full-width chat UI | ⬜ | No table visible |
| Creation system prompt | ⬜ | 4 required questions |
| LLM proposes goal + 7 days | ⬜ | Structured output |
| Show proposal for confirmation | ⬜ | |
| Save all on confirm | ⬜ | Goal + days + messages |
| Handle "Change X" | ⬜ | LLM revises proposal |
| Handle abandonment | ⬜ | No draft saved |

### Exit Criteria
- [ ] Guided questions flow naturally
- [ ] Proposal includes title + description + ~3 filled days
- [ ] User can confirm or request changes
- [ ] Saved goal appears in sidebar

**Milestone:** Chat-guided goal creation works ✨

---

## Phase 8: Multi-Goal + Polish ⬜

**Goal:** Full app experience, ready for users.

| Task | Status | Notes |
|------|--------|-------|
| Goal switching preserves state | ⬜ | |
| Independent message histories | ⬜ | |
| Streaming with loading indicator | ⬜ | |
| Proactive LLM prompts | ⬜ | "How did Monday go?" |
| Summarize long conversations | ⬜ | 50+ messages |
| Today row highlighting | ⬜ | |
| 1 week ahead + history | ⬜ | |
| Mobile responsive layout | ⬜ | |
| Error boundaries | ⬜ | |
| Loading skeletons | ⬜ | |

### Exit Criteria
- [ ] 3 goals work independently
- [ ] Switching goals is seamless
- [ ] Mobile layout usable
- [ ] No crashes on errors

**Milestone:** Production-quality app ✨

---

## Phase 9: Deploy ⬜

**Goal:** App is live.

| Task | Status | Notes |
|------|--------|-------|
| Set up Vercel project | ⬜ | |
| Configure production env vars | ⬜ | |
| Apply migrations to prod Supabase | ⬜ | |
| Test production build | ⬜ | `npm run build` |
| Deploy to Vercel | ⬜ | |
| Smoke test production | ⬜ | |
| Set up error monitoring | ⬜ | |

### Exit Criteria
- [ ] App accessible at production URL
- [ ] Auth works in production
- [ ] LLM calls work in production
- [ ] No console errors

**Milestone:** App is live! 🚀

---

## Progress Summary

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup | ✅ |
| 1 | Auth + Layout Shell | ✅ |
| 2 | Goal CRUD + Table + Manual Edit | ✅ |
| 3 | Chat UI + Basic LLM | ✅ |
| 4 | LLM → Intent (today/tomorrow) | ✅ |
| 5 | LLM → Action + Notes | ⬜ |
| 6 | LLM → Any Date | ⬜ |
| 7 | Goal Creation via Chat | ⬜ |
| 8 | Multi-Goal + Polish | ⬜ |
| 9 | Deploy | ⬜ |

**Overall Progress:** 5 / 10 phases complete
