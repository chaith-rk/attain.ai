# attain.ai

Goal achievement through conversation. Plan your daily intents with an LLM coach and track your progress over time.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Components:** shadcn/ui
- **State:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **LLM:** OpenAI GPT-4o-mini
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- An OpenAI Platform account with billing enabled (see setup below)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd attain.ai
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, get your credentials:
   - Project URL (Settings → API)
   - Anon key (Settings → API)
3. Run the database migration:
   - Open Supabase SQL Editor
   - Copy contents of `supabase/migrations/20241227000000_initial_schema.sql`
   - Paste and run in SQL Editor

See `supabase/README.md` for detailed instructions.

### 3. Set Up OpenAI API

**Note:** This is the OpenAI Platform API, NOT ChatGPT. They are separate services.

1. Create an OpenAI Platform account at [platform.openai.com/signup](https://platform.openai.com/signup)
2. Add billing at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
   - You'll need to add a payment method
   - Cost: GPT-4o-mini is ~$0.15 per 1M input tokens (very cheap - typical conversations cost pennies)
3. Create an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key immediately (you won't see it again)
   - Keep it secure - never commit it to git

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

**Where to get each value:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From step 2 (Supabase project settings)
- `OPENAI_API_KEY`: From step 3 (OpenAI Platform API keys page)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app              # Next.js App Router pages and layouts
/components       # Reusable UI components (shadcn/ui)
/lib              # Utilities, Supabase clients, helpers
  /supabase       # Supabase client configurations
/hooks            # Custom React hooks
/stores           # Zustand state stores
/types            # TypeScript type definitions
/supabase         # Database migrations and docs
  /migrations     # SQL migration files
/docs             # Project documentation
```

## Documentation

- **PRD:** `docs/prd.md` - Complete product requirements
- **Progress:** `docs/progress.md` - Implementation roadmap and status
- **Changelog:** `docs/changelog.md` - History of all changes
- **Claude Instructions:** `CLAUDE.md` - Guidelines for working with Claude Code

## Development Workflow

See `CLAUDE.md` for detailed development guidelines including:
- Phase-based development approach
- Documentation requirements
- Code style guidelines
- Commit message format
- Pre-approved actions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## License

See LICENSE file for details.