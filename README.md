# CiteMate

CiteMate is a student-focused citation and research workspace built with Next.js and Supabase. It helps college students save sources, generate citations, organize references by subject, write source-linked notes, and run a final plagiarism-prevention checklist before submission.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, Postgres, and Storage
- Zod
- React Hook Form

## Core Features

- Email/password authentication with protected dashboard routes
- Source library with search, filtering, tags, subjects, and attachments
- Citation generator for APA 7, MLA 9, and Chicago
- Source-linked note taking with multiline content
- Academic writing checklist with saved progress
- Dashboard with research stats, recent activity, and quick actions

## Project Structure

```text
src/
  actions/              Server actions for auth and feature mutations
  app/                  Next.js routes, layouts, loading states, and API routes
  components/
    app/                App-specific UI blocks
    ui/                 Shared shadcn/ui primitives
  lib/
    citations/          Citation formatting engine and tests
    data/               Server-side data loaders
    supabase/           Browser/server/middleware Supabase clients
    validations/        Zod schemas
  types/                App-level shared types
supabase/
  migrations/           SQL migration snapshot
  schema.sql            Manual setup SQL for Supabase SQL Editor
  seed.sql              Local sample data
docs/
  setup-checklist.md
  deployment-vercel-supabase.md
  future-improvements.md
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |

Important:

- Do not add the Supabase service role key to this app.
- Only the anon public key is needed in the Next.js runtime.
- `.env*` files are ignored by git in this repo.

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy env vars.

```bash
cp .env.example .env.local
```

3. Create a Supabase project.

4. In Supabase SQL Editor, run `supabase/schema.sql`.

5. Optional for local sample data: run `supabase/seed.sql`.

6. In Supabase Auth settings:
   - enable email/password auth
   - set Site URL to `http://localhost:3000`
   - add `http://localhost:3000/auth/callback` to Redirect URLs

7. Start the dev server.

```bash
npm run dev
```

## Verification

Run the standard checks before shipping changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Supabase Notes

- `supabase/schema.sql` is the recommended manual setup file for a fresh project.
- `supabase/migrations/202603170001_initial_citemate_schema.sql` is kept in sync as the migration snapshot.
- `supabase/seed.sql` is for local or staging sample data, not production content.
- Row-level security is enabled for user-owned tables.
- Source attachments are stored in the private `source-files` bucket with per-user policies.

## Security Model

- Auth is handled with Supabase SSR helpers and Next.js middleware.
- Protected dashboard routes redirect unauthenticated users to sign in.
- Server actions always resolve the current authenticated user on the server.
- Every user-owned table is protected with RLS policies.
- Source file access is restricted through signed URLs and storage policies.

## UX Notes

- Dedicated loading and error boundaries exist for dashboard feature areas.
- Empty states are included for sources, notes, subjects, and checklist views.
- Forms use Zod validation and friendly error messaging.
- Layouts are responsive across desktop and mobile widths.

## Additional Docs

- [Setup checklist](./docs/setup-checklist.md)
- [Vercel + Supabase deployment guide](./docs/deployment-vercel-supabase.md)
- [Future improvements](./docs/future-improvements.md)
