# attain.ai — Progress Tracker

This document breaks down the project into manageable phases. Each phase builds on the previous one.

---

## How to Use This Document

- **Status Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete
- Work through phases in order — each depends on the previous
- Check off tasks as you complete them
- Update the changelog when finishing significant work

---

## Phase 0: Project Setup ✅

Get the foundation in place before writing any features.

| Task | Status | Notes |
|------|--------|-------|
| Initialize Next.js 14 project with TypeScript | ✅ | Set up manually with App Router |
| Install Tailwind CSS | ✅ | v3 with PostCSS |
| Set up shadcn/ui | ✅ | Configured with CSS variables |
| Create Supabase project | ✅ | Migration files ready in `supabase/` |
| Add environment variables | ✅ | `.env.local` template created |
| Run database migrations | ✅ | SQL ready in `supabase/migrations/` |
| Install Zustand | ✅ | Installed with initial store |
| Set up project folder structure | ✅ | All directories created |

**Milestone:** App runs locally, connects to Supabase ✨

---

## Phase 1: Authentication ⬜

Users need to log in before they can create goals.

| Task | Status | Notes |
|------|--------|-------|
| Set up Supabase Auth | ⬜ | Email + password to start |
| Create login page | ⬜ | `/login` route |
| Create signup page | ⬜ | `/signup` route |
| Add auth middleware | ⬜ | Protect `/app` routes |
| Create auth context/hook | ⬜ | `useAuth()` hook |
| Add logout functionality | ⬜ | Button in sidebar |
| Test login/signup flow | ⬜ | Manual testing |

**Milestone:** Users can sign up, log in, and log out ✨

---

## Phase 2: Layout & Navigation ⬜

Build the app shell before adding features.

| Task | Status | Notes |
|------|--------|-------|
| Create main app layout | ⬜ | Sidebar + main area |
| Build sidebar component | ⬜ | Logo, goal list, create button |
| Add responsive design | ⬜ | Mobile-friendly sidebar |
| Create empty states | ⬜ | "No goals yet" message |
| Style with Tailwind | ⬜ | Match PRD mockup |

**Milestone:** App shell looks like the PRD mockup ✨

---

## Phase 3: Goal Management ⬜

Basic goal CRUD without the chat interface.

| Task | Status | Notes |
|------|--------|-------|
| Create goals table in Supabase | ⬜ | Already in PRD schema |
| Build goal creation form (simple) | ⬜ | Title + description for now |
| Display goals in sidebar | ⬜ | Clickable list |
| Add goal selection state | ⬜ | Zustand store |
| Create goal detail view | ⬜ | Shows title + description |
| Add delete goal functionality | ⬜ | With confirmation modal |
| Enforce 3 goal limit | ⬜ | Disable button when at limit |
| Add RLS policies | ⬜ | Users see only their goals |

**Milestone:** Create, view, and delete goals (no chat yet) ✨

---

## Phase 4: Table View ⬜

The table that shows intent vs action over time.

| Task | Status | Notes |
|------|--------|-------|
| Create goal_days table in Supabase | ⬜ | Already in PRD schema |
| Build table component | ⬜ | Date, Intent, Action, Notes columns |
| Display goal_days for selected goal | ⬜ | Query by goal_id |
| Highlight today's row | ⬜ | Visual distinction |
| Show 1 week ahead + history | ⬜ | Filter logic |
| Handle empty cells | ⬜ | Show "—" |
| Add loading states | ⬜ | Skeleton or spinner |

**Milestone:** Table displays goal_days data correctly ✨

---

## Phase 5: Chat Interface (UI Only) ⬜

Build the chat UI before connecting the LLM.

| Task | Status | Notes |
|------|--------|-------|
| Create messages table in Supabase | ⬜ | Already in PRD schema |
| Build chat container component | ⬜ | Header + messages + input |
| Create message bubble component | ⬜ | User vs assistant styles |
| Build chat input with send button | ⬜ | Text input + button |
| Display message history | ⬜ | Query messages by goal_id |
| Add auto-scroll to bottom | ⬜ | On new messages |
| Save user messages to database | ⬜ | On send |
| Add loading indicator | ⬜ | While waiting for response |

**Milestone:** Chat UI works, messages save to database ✨

---

## Phase 6: LLM Integration ⬜

Connect OpenAI and make the chat functional.

| Task | Status | Notes |
|------|--------|-------|
| Set up OpenAI API client | ⬜ | Server-side only |
| Create chat API route | ⬜ | `/api/chat` endpoint |
| Build system prompt | ⬜ | Coaching persona + context |
| Send goal context to LLM | ⬜ | Title, description, recent goal_days |
| Send message history to LLM | ⬜ | Last N messages |
| Stream responses to UI | ⬜ | Better UX than waiting |
| Save assistant messages | ⬜ | To messages table |
| Handle API errors gracefully | ⬜ | Show error message |

**Milestone:** Chat with LLM works, responses stream in ✨

---

## Phase 7: LLM Actions ⬜

Let the LLM update the table based on conversation.

| Task | Status | Notes |
|------|--------|-------|
| Define function calling schema | ⬜ | For table updates |
| Parse LLM intent to update goal_days | ⬜ | Extract date, intent, action |
| Create goal_days via chat | ⬜ | "I'll run Tuesday" → creates row |
| Update intent column | ⬜ | Planning flow |
| Update action column | ⬜ | Check-in flow |
| Auto-generate notes | ⬜ | Compare intent vs action |
| Confirm before bulk updates | ⬜ | "I'll mark these complete, right?" |
| Real-time table refresh | ⬜ | Supabase realtime or refetch |

**Milestone:** LLM can read and write to the table ✨

---

## Phase 8: Goal Creation Flow ⬜

Replace simple form with guided chat creation.

| Task | Status | Notes |
|------|--------|-------|
| Create goal creation chat mode | ⬜ | Full-width, no table |
| Build guided question flow | ⬜ | 4 required questions |
| LLM proposes goal + 7 days | ⬜ | Structured output |
| User confirms or edits | ⬜ | Before saving |
| Save goal + goal_days + messages | ⬜ | All at once |
| Transition to goal view | ⬜ | After confirmation |

**Milestone:** Full goal creation flow via chat ✨

---

## Phase 9: Polish & Edge Cases ⬜

Make it feel complete.

| Task | Status | Notes |
|------|--------|-------|
| Handle long conversation history | ⬜ | Summarize older messages |
| Add proactive LLM prompts | ⬜ | "How did Monday go?" |
| Goal switching preserves state | ⬜ | Save/restore correctly |
| Error boundaries | ⬜ | Graceful error handling |
| Loading skeletons | ⬜ | Better perceived performance |
| Mobile responsive polish | ⬜ | Test on small screens |
| Keyboard shortcuts | ⬜ | Enter to send, etc. |

**Milestone:** App feels polished and handles edge cases ✨

---

## Phase 10: Deploy ⬜

Ship it!

| Task | Status | Notes |
|------|--------|-------|
| Set up Vercel project | ⬜ | Connect to GitHub |
| Configure environment variables | ⬜ | In Vercel dashboard |
| Set up production Supabase | ⬜ | Or use same project |
| Test production build | ⬜ | `npm run build` |
| Deploy to Vercel | ⬜ | Push to main branch |
| Set up custom domain (optional) | ⬜ | attain.ai if available |
| Monitor for errors | ⬜ | Check logs |

**Milestone:** App is live on the internet! 🚀

---

## Future Phases (v2)

These come after the core app is working.

| Phase | Description |
|-------|-------------|
| Mobile App | React Native / Expo version |
| Reminders | Push notifications to plan ahead |
| Voice Input | Speak instead of type |
| Weekly Summary | Auto-generated progress report |
| Social Login | Google, Apple sign-in |

---

## Progress Summary

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup | ✅ |
| 1 | Authentication | ⬜ |
| 2 | Layout & Navigation | ⬜ |
| 3 | Goal Management | ⬜ |
| 4 | Table View | ⬜ |
| 5 | Chat Interface (UI) | ⬜ |
| 6 | LLM Integration | ⬜ |
| 7 | LLM Actions | ⬜ |
| 8 | Goal Creation Flow | ⬜ |
| 9 | Polish & Edge Cases | ⬜ |
| 10 | Deploy | ⬜ |

**Overall Progress:** 1 / 10 phases complete
