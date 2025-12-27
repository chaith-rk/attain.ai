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
