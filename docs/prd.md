# attain.ai — Product Requirements Document (v0)

## Overview

attain.ai is a goal achievement app that combines an LLM chat interface with a structured table view. Users create up to 3 goals, plan daily intents through conversation, and track their actual actions over time. The LLM serves as a coach that remembers everything and helps users stay on track without guilt or pressure.

---

## Core Principles

- Chat is the primary input method. Users never edit the table directly.
- The table is the primary output. It shows intent vs. action over time.
- No penalties for missed days. The app is supportive, not punitive.
- The LLM remembers everything. Challenges, context, preferences — all stored.
- Start minimal. Each feature ships as v0 and evolves.

---

## Data Model

### goals

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| title | text | One-line goal title |
| description | text (nullable) | Context from creation chat (monthly/weekly framing) |
| created_at | timestamp | When goal was created |

### goal_days

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| goal_id | uuid | Foreign key to goals |
| date | date | The calendar date |
| intent | text (nullable) | What user planned to do (filled during planning) |
| action | text (nullable) | What user actually did (filled only from user report) |
| notes | text (nullable) | LLM comparison of intent vs action |
| created_at | timestamp | When row was created |

### messages

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| goal_id | uuid (nullable) | Links message to a goal (null for general chat) |
| role | text | "user" or "assistant" |
| content | text | Message content |
| created_at | timestamp | When message was sent |

---

## UI Layout

### Left Sidebar
- App title: "attain.ai"
- "Create Goal" button (greyed out when 3 goals exist)
- List of goals (clickable)
- Selected goal is highlighted

### Main Area (when goal selected)

**Left section: Table view**
- Shows goal title and description at top
- Table with columns: Date, Intent, Action, Notes
- Displays: 1 week ahead + all history
- Today's row is highlighted
- Empty cells show "—"

**Right section: Chat view**
- Header shows "Chat" with subtitle "Plan and update your goal"
- Message history for selected goal
- Input field + Send button

### Main Area (when creating goal)
- Full-width guided chat
- No table visible until goal is confirmed

---

## Module 1: Goal Creation

### Trigger
User clicks "Create Goal" button

### Flow
1. Guided chat opens
2. LLM asks required questions (minimum needed)
3. User answers
4. LLM proposes: title, description, first 7 days
5. User confirms or requests edits
6. Goal saved, user lands on goal view

### Required Questions

| # | Question | Purpose |
|---|----------|---------|
| 1 | "What do you want to work on?" | Get goal topic |
| 2 | "Where do you want to be with this in a month?" | Monthly intent |
| 3 | "What would make this week feel like progress?" | Weekly intent |
| 4 | "What's one thing you could do in the next few days?" | Seed daily intents |

### Optional Follow-ups (LLM decides)
- "Anything that might get in the way?"
- "Any specific days that work better for you?"

### Output After Confirmation
- Goal created with title + description
- 7 rows in goal_days (next 7 calendar days)
- At least 3 rows have intent/action filled
- Chat history saved with goal_id

### Example LLM Output

**Title:** Run a half marathon

**Description:** Training for a March race. This month: build base to 15 miles/week. This week: 3 easy runs to establish routine.

| Date | Intent | Action | Notes |
|------|--------|--------|-------|
| Dec 27 | Easy 2 mile run | — | — |
| Dec 28 | — | — | — |
| Dec 29 | Easy 3 mile run | — | — |
| Dec 30 | — | — | — |
| Dec 31 | Cross training | — | — |
| Jan 1 | — | — | — |
| Jan 2 | Easy 2 mile run | — | — |

### Constraints
- Max 3 goals per user
- "Create Goal" button greyed out at limit

---

## Module 2: Goal Editing

### Editable Fields

| Field | Method |
|-------|--------|
| Title | User requests in chat → LLM proposes → User confirms |
| Description | User requests in chat → LLM updates |

### Delete Goal

| Trigger | UI button on goal view |
|---------|------------------------|
| Confirmation | Modal: "Delete this goal? This will remove all your plans and chat history for this goal. This can't be undone." |
| Actions | [Cancel] [Delete] |
| On delete | Remove: goal row + all goal_days + all messages for that goal |
| After delete | Return to empty state or next goal if exists |

### Changing Goal Direction
- No separate flow
- User discusses in chat
- LLM updates description and/or title as needed
- LLM adjusts upcoming goal_days if relevant

---

## Module 3: Table Creation

### When Rows Are Created

| Trigger | What Happens |
|---------|--------------|
| Goal creation | 7 rows created (next 7 days), at least 3 filled |
| User chats about future days | LLM creates rows as needed |
| User says "repeat for a month" | LLM creates ~30 rows with pattern |
| Time passes | Nothing auto-created |

### Row States
- Empty (no intent/action/notes)
- Partially filled
- Fully filled
- All updates come from chat

### Display Rules
- Show 1 week ahead from today
- Show all history
- Today's row highlighted

---

## Module 4: Table Editing

### Column Definitions

| Column | What It Holds | When Filled | By Whom |
|--------|---------------|-------------|---------|
| Intent | What user plans to do | During planning (before/on the day) | LLM based on chat |
| Action | What user actually did | Only when user reports | LLM based on user input |
| Notes | Intent vs Action comparison | After Action is filled | LLM auto-generates |

### Key Rules
1. Intent = planning. Filled before or on the day.
2. Action = reality. ONLY filled when user explicitly reports.
3. Notes = reflection. Auto-generated by LLM after Action exists.
4. If no Action reported, Notes stays empty.

### Flow Example

| Stage | User Says | What Updates |
|-------|-----------|--------------|
| Planning (Dec 26) | "I'll run 3 miles on Tuesday" | Dec 31 Intent = "Run 3 miles" |
| Check-in (Jan 1) | "I ran yesterday but only did 2 miles" | Dec 31 Action = "Ran 2 miles" |
| Auto-generated | — | Dec 31 Notes = "Partial: ran but shorter than planned" |

### Bulk Update Example

| User Says | What Updates |
|-----------|--------------|
| "I hit all my goals for the last 3 days" | Action for each = "Completed as planned" |
| | Notes for each = "Achieved" |

### Editing Scenarios

| Scenario | User Says | LLM Does |
|----------|-----------|----------|
| Plan ahead | "I want to run Tuesday and Thursday" | Fill Intent for those dates |
| Move a day | "Move Thursday to Friday" | Clear Thursday Intent, fill Friday |
| Report action | "I did my run today" | Fill Action for today |
| Missed day | "I skipped Monday, was too tired" | Fill Action = "Skipped", Notes = "Missed: user was tired" |
| Bulk clear | "Clear the rest of the week" | Empty Intent for remaining days |

---

## Module 5: Chat Behavior

### Chat Modes

| Mode | Trigger | LLM Behavior |
|------|---------|--------------|
| Goal creation | User clicks "Create Goal" | Guided questions → goal + 7 rows |
| Planning | User talks about future | Fill Intent column |
| Check-in | User reports what they did | Fill Action column, generate Notes |
| General | User vents, shares context | Respond naturally, store everything |

### Context Sent to LLM (Per Message)

| Data | Amount | Purpose |
|------|--------|---------|
| Goal title + description | All | Know what user is working on |
| goal_days | Last 4 weeks | See recent intent/action/notes |
| messages | All (see handling below) | Full history |

### Handling Long Conversation History

| Message Count | Approach |
|---------------|----------|
| Under 50 | Send all messages |
| 50–200 | Last 30 full + LLM summary of older |
| 200+ | Last 30 full + rolling summary |

### Proactive Behavior

| Situation | LLM Does |
|-----------|----------|
| Past day has Intent but no Action | "How did Monday's run go?" |
| Multiple unfilled days | "We haven't caught up since Thursday — quick recap?" |
| User mentioned challenge before | "Last week you said mornings were hard. Did that change?" |

### Chat Rules

| Rule | Detail |
|------|--------|
| One question at a time | Don't overwhelm |
| Confirm before bulk updates | "I'll mark Mon/Tue/Wed complete — right?" |
| Summarize changes | "Updated: Tuesday action = ran 3 miles" |
| Remember everything | Challenges, preferences, context |
| Warm tone, not pushy | No guilt for missed days |

### Switching Goals
1. Save current chat state
2. Clear chat visually
3. Load all messages for new goal
4. LLM receives new goal's full context
5. Conversation continues where it left off

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | React framework with SSR, API routes, file-based routing |
| Language | TypeScript | Type safety across frontend and backend |
| Styling | Tailwind CSS | Utility-first CSS for rapid UI development |
| Components | shadcn/ui | Accessible, customizable component library |
| State Management | Zustand | Lightweight global state for UI state |
| Database | Supabase (Postgres) | Managed Postgres with realtime subscriptions |
| Auth | Supabase Auth | Email/password + social login, integrates with RLS |
| LLM | OpenAI GPT-4o-mini | Cost-effective model for goal coaching (~$0.15/1M input) |
| Hosting | Vercel | Optimized Next.js hosting with edge functions |
| Mobile (v2) | React Native / Expo | Cross-platform mobile app, shares logic with web |

### Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server components for fast initial load, streaming for chat |
| Supabase Realtime | Table updates sync instantly when LLM modifies goal_days |
| GPT-4o-mini | Cheapest OpenAI model, fast responses, sufficient for coaching |
| shadcn/ui | Copy-paste components, full control, works great with Tailwind |
| React Native for mobile | Code sharing with web, single JS/TS codebase |

---

## Technical Notes

### Supabase Schema

```sql
-- Goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Goal days table
create table goal_days (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  date date not null,
  intent text,
  action text,
  notes text,
  created_at timestamp with time zone default now(),
  unique(goal_id, date)
);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  goal_id uuid references goals(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_goals_user on goals(user_id);
create index idx_goal_days_goal on goal_days(goal_id);
create index idx_goal_days_date on goal_days(goal_id, date);
create index idx_messages_goal on messages(goal_id);
create index idx_messages_created on messages(goal_id, created_at);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table goals enable row level security;
alter table goal_days enable row level security;
alter table messages enable row level security;

-- Policies: users can only access their own data
create policy "Users can manage own goals" on goals
  for all using (auth.uid() = user_id);

create policy "Users can manage own goal_days" on goal_days
  for all using (
    goal_id in (select id from goals where user_id = auth.uid())
  );

create policy "Users can manage own messages" on messages
  for all using (auth.uid() = user_id);
```

---

## v2 Features (Parked)

| Feature | Description |
|---------|-------------|
| Reminders | 2 days before week starts, prompt user to plan ahead |
| Voice input | Speak instead of type |
| Automated calls | LLM calls user for check-ins |
| Archive goals | Hide completed goals instead of delete |
| Weekly summary | Auto-generated report of the week |

---

## UI Mockup Reference

A React component mockup demonstrating the layout is available at:

`attain-mockup.jsx`

The mockup shows:
- Left sidebar with goal list and "Create Goal" button
- Table view with Date/Intent/Action/Notes columns
- Chat panel alongside the table
- Goal creation flow with guided chat
- Visual highlighting for today's row
- Greyed-out button state when at 3 goals

---

## Open Questions for Future

1. Should users be able to reorder goals in the sidebar?
2. Should there be a "today" view across all goals?
3. How do we handle timezone for date boundaries?
4. Should completed goals auto-archive after X weeks of no activity?
5. Do we need an onboarding flow for first-time users?

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v0 | Dec 2024 | Initial PRD |
