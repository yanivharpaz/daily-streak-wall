# Daily Streak Wall

Mark today as done. Build a streak. Watch your wall fill up.

A small Next.js + Supabase app: email login, one-click daily check-in, current/longest streak counters, and a GitHub-style yearly calendar wall.

## Stack

- **Next.js 14** (App Router, Server Actions)
- **Supabase** (Auth + Postgres with RLS)
- **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- Deploys to **Vercel**

## Project layout

```
app/
  layout.tsx
  page.tsx              landing
  login/                email + password sign-in / sign-up (server actions)
  auth/callback/        OAuth/magic-link code exchange
  dashboard/            streak counters, check-in button, wall
components/
  ui/                   shadcn primitives (button, card, input, label)
  streak-calendar.tsx   GitHub-style heatmap
lib/
  streaks.ts            streak math + calendar grid builder
  supabase/             browser/server/middleware clients
middleware.ts           refreshes Supabase session, gates /dashboard
supabase/schema.sql     table + RLS policies
```

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `check_ins` table with RLS policies that scope every row to its owner.
3. **Authentication → Providers → Email**: enable Email. For local dev you can disable "Confirm email" so sign-up returns a session immediately; in production leave it on.
4. **Authentication → URL Configuration**: add your site URL (e.g. `http://localhost:3000`, and your Vercel URL) to **Site URL** and **Redirect URLs**.

## 2. Local development

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from Supabase → Project Settings → API
npm install
npm run dev
```

Open <http://localhost:3000>, create an account, and click **Mark today as done**.

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. **Import Project** in Vercel and point it at the repo.
3. Add the environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://daily-streak-wall.vercel.app`)
4. Add the deployed URL to Supabase **Authentication → URL Configuration → Redirect URLs**.

That's it — no extra Vercel config needed.

## Data model

```sql
check_ins (
  id            uuid pk,
  user_id       uuid → auth.users(id) on delete cascade,
  check_in_date date,
  created_at    timestamptz,
  unique (user_id, check_in_date)
)
```

The `unique (user_id, check_in_date)` constraint enforces "one check-in per user per day"; the server action treats a duplicate-key error (Postgres `23505`) as a no-op so the button is idempotent.

RLS makes every query implicitly `where user_id = auth.uid()` — the anon key alone can never read another user's rows.

## Streak math

`computeStreaks(dates)` in [`lib/streaks.ts`](./lib/streaks.ts):

- **Current**: walk back from today (or yesterday if today isn't checked in) over consecutive days.
- **Longest**: single pass over the sorted unique dates.
- All date keys are `YYYY-MM-DD` in the viewer's local time, so streaks don't drift across timezones.
