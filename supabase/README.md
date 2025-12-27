# Supabase Setup

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose an organization or create one
5. Fill in project details:
   - **Name:** attain-ai (or your preferred name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
6. Click "Create new project"

## 2. Get Your API Credentials

Once your project is created:

1. Go to Project Settings (gear icon in sidebar)
2. Navigate to "API" section
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run Database Migrations

You have two options:

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase project dashboard, go to the SQL Editor
2. Open the file `supabase/migrations/20241227000000_initial_schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run"
6. Verify tables were created in the "Table Editor" tab

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 5. Verify Setup

After running migrations, you should see these tables in your Supabase dashboard:
- `user_profiles`
- `goals`
- `goal_days`
- `messages`

Each table should have Row Level Security (RLS) enabled.

## Next Steps

Once Supabase is set up, you can continue with local development!
