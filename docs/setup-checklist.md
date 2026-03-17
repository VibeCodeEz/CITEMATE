# Setup Checklist

## Local Development

- [ ] Install dependencies with `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Create a Supabase project
- [ ] Run `supabase/schema.sql` in the Supabase SQL Editor
- [ ] Optionally run `supabase/seed.sql` for sample data
- [ ] Enable email/password auth in Supabase
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Add `http://localhost:3000/auth/callback` to Redirect URLs
- [ ] Start the app with `npm run dev`

## Before Shipping

- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Confirm sign up, sign in, sign out, and protected route redirects
- [ ] Confirm row-level security policies are active in Supabase
- [ ] Confirm `source-files` storage bucket exists and is private
