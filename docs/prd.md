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

### user_profiles

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key (same as auth.users.id) |
| timezone | text | IANA timezone string (e.g., "America/New_York") |
| chat_summary | text (nullable) | Rolling summary of older messages per goal |
| created_at | timestamp | When profile was created |
| updated_at | timestamp | Last update |

### goals

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| title | text | One-line goal title (max 100 chars) |
| description | text (nullable) | Context from creation chat (max 500 chars) |
| created_at | timestamp | When goal was created |
| updated_at | timestamp | Last update |

### goal_days

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| goal_id | uuid | Foreign key to goals |
| date | date | The calendar date (stored as local date, not UTC) |
| intent | text (nullable) | What user planned to do (max 200 chars) |
| action | text (nullable) | What user actually did (max 200 chars) |
| notes | text (nullable) | LLM comparison of intent vs action (max 300 chars) |
| created_at | timestamp | When row was created |
| updated_at | timestamp | Last update |

### messages

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| goal_id | uuid | Links message to a goal (required, no general chat) |
| role | text | "user" or "assistant" |
| content | text | Message content (max 2000 chars) |
| created_at | timestamp | When message was sent |

### Timezone Handling

- All timestamps stored in UTC
- User's timezone stored as IANA string in user_profiles (e.g., "America/New_York")
- Client sends current timezone with each chat request; server uses it as primary
- Profile timezone is a fallback when client timezone is missing or invalid
- goal_days.date stored as local DATE (not timestamp) — represents the user's calendar day
- "Today", "yesterday", and "overdue" calculated using user's timezone
- Day boundaries flip at local midnight, not UTC midnight
- Use Intl.DateTimeFormat with explicit timeZone for date math and formatting

---

## UI Layout

### Left Sidebar
- App title: "attain.ai"
- "Create Goal" button (greyed out when 3 goals exist)
- List of goals (clickable)
- Selected goal is highlighted

### Main Area (when goal selected)

**Desktop: Split view**
- Left section: Table view
- Right section: Chat view

**Mobile web: Chat-first**
- Chat is the primary view
- Table accessible via toggle/tab
- Sidebar collapses to hamburger menu

**Left section: Table view**
- Shows goal title and description at top
- Table with columns: Date, Intent, Action, Notes
- Displays: 1 week ahead + all history (infinite scroll)
- Today's row is highlighted
- Empty cells show "—"

**Right section: Chat view**
- Header shows "Chat" with subtitle "Plan and update your goal"
- Message history for selected goal
- Input field + Send button

### Main Area (when creating goal)
- Full-width guided chat
- No table visible until goal is confirmed

### First-Time User Experience
- User signs up → lands on empty main area
- Middle section shows welcome message: "Welcome to attain.ai. Let's set your first goal."
- "Create Goal" button is prominently displayed
- No complex onboarding — learn by doing
- After first goal created, normal UI appears

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
- 7 rows in goal_days (yesterday + today + next 5 days)
- At least 3 rows have intent filled (action is never pre-filled — it's what user actually did)
- Chat history saved with goal_id

### Goal Creation Edge Cases
- If user abandons mid-creation (closes browser, navigates away): conversation is lost, no draft saved
- If user gives vague answers: LLM pushes back gently until answers are specific enough to fill the UI
- LLM should ask clarifying questions rather than accept unusable input like "I want to be better"

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
| Goal creation | 7 rows created (yesterday + today + next 5 days), at least 3 filled |
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
- Show all history (infinite scroll)
- Today's row highlighted
- v2: Collapse old months for better performance

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
| 50+ | Last 30 full + stored summary of older messages |

**Summary Strategy:**
- When message count exceeds 50, generate a summary of messages 1-20
- Store summary in user_profiles.chat_summary (one per goal, keyed by goal_id in JSON)
- Summary is regenerated when another 50 messages accumulate
- Summary captures: key context, challenges mentioned, preferences, patterns

### Proactive Behavior

**Trigger:** Only when user sends a message (never unsolicited on page load)

**Tone:** Like a good therapist friend — warm, mildly accountable, never pushy or guilt-inducing. Hold them in a caring way.

| Situation | LLM Does |
|-----------|----------|
| Past day has Intent but no Action | "How did Monday's run go?" (gentle check-in) |
| Multiple unfilled days | "We haven't caught up since Thursday — how's it been going?" |
| User mentioned challenge before | "Last week you mentioned mornings were hard. Has anything shifted?" |
| User reports missing a day | Acknowledge without judgment: "That happens. What got in the way?" |

### Chat Rules

| Rule | Detail |
|------|--------|
| One question at a time | Don't overwhelm |
| Confirm before updates | Show a confirmation card before any intent/action changes |
| Summarize changes | "Updated: Tuesday action = ran 3 miles" |
| Remember everything | Challenges, preferences, context |
| Warm tone, not pushy | No guilt for missed days |

### Confirmation UI

When the assistant proposes a table change, it presents a compact confirmation card:
- Shows "Intent" and "Date" on two lines
- Includes a single "Confirm" button
- On confirm, the update is applied and the card shows a confirmed state

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
| OpenAI Function Calling | Structured output for table updates (see A/B test below) |

### LLM Table Update Strategy

The LLM needs to update goal_days based on chat. Two approaches to A/B test:

**Option A: Function Calling (launch with this)**
- Define functions: `update_intent`, `update_action`, `create_goal_day`, `delete_goal_day`
- LLM calls functions with structured params: `{ date, value }`
- Validated server-side before writing to DB

**Option B: Structured Outputs (experiment)**
- Use OpenAI's JSON schema mode
- LLM returns `{ actions: [{ type, date, value }] }` in every response
- Parse and execute actions

**A/B Test Plan:**
1. Launch with Function Calling (more battle-tested)
2. After 2 weeks, implement Structured Outputs behind feature flag
3. Compare: reliability, latency, token usage, error rates
4. Pick winner based on data

### Error Handling

| Error Type | User Sees | Debug Info |
|------------|-----------|------------|
| OpenAI API down | "Having trouble connecting. Try again in a moment." + retry button | Log: full error, timestamp, request payload |
| Rate limited | "You're chatting fast! Give me a second." + auto-retry after delay | Log: rate limit headers, user_id, frequency |
| Malformed LLM response | "Something went wrong. Your message was saved — trying again." | Log: raw response, expected schema, parse error |
| Database error | "Couldn't save that. Please try again." | Log: query, error code, stack trace |
| Network timeout | "Connection timed out. Check your internet." | Log: timeout duration, endpoint |

**Error Logging Requirements:**
- All errors logged with: timestamp, user_id, goal_id, error type, full stack trace
- Structured JSON logs for easy filtering
- Include request/response payloads (sanitized of secrets)
- Surface actionable errors to user; log everything for debugging

---

## Technical Notes

### Supabase Schema

```sql
-- User profiles table (extends auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'America/New_York',
  chat_summaries jsonb default '{}', -- { goal_id: "summary text" }
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 500),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Goal days table
create table goal_days (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  date date not null, -- stored as local date in user's timezone
  intent text check (char_length(intent) <= 200),
  action text check (char_length(action) <= 200),
  notes text check (char_length(notes) <= 300),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(goal_id, date)
);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  goal_id uuid references goals(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 2000),
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_goals_user on goals(user_id);
create index idx_goal_days_goal on goal_days(goal_id);
create index idx_goal_days_date on goal_days(goal_id, date);
create index idx_messages_goal on messages(goal_id);
create index idx_messages_created on messages(goal_id, created_at);
create index idx_user_profiles_id on user_profiles(id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to tables with updated_at
create trigger goals_updated_at before update on goals
  for each row execute function update_updated_at();
create trigger goal_days_updated_at before update on goal_days
  for each row execute function update_updated_at();
create trigger user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at();
```

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table user_profiles enable row level security;
alter table goals enable row level security;
alter table goal_days enable row level security;
alter table messages enable row level security;

-- Policies: users can only access their own data
create policy "Users can manage own profile" on user_profiles
  for all using (auth.uid() = id);

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
3. Should completed goals auto-archive after X weeks of no activity?

**Resolved:**
- ~~Timezone handling~~ → Store timestamps UTC, dates as local, use IANA timezone string
- ~~Onboarding flow~~ → Simple welcome message, learn by doing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v0 | Dec 2024 | Initial PRD |
| v0.1 | Dec 2024 | Added: timezone handling, user_profiles table, character limits, error handling, mobile layout, first-time UX, function calling A/B test plan, chat summarization strategy, goal creation edge cases |
