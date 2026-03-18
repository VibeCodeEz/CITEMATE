# Deploying CiteMate to Vercel + Supabase

## 1. Prepare Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Optional: do not run `supabase/seed.sql` in production unless you explicitly want demo data.
4. In Authentication settings:
   - enable email/password auth
   - set Site URL to your Vercel production URL
   - add both preview and production callback URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-preview-domain.vercel.app/auth/callback` if needed

## 2. Create the Vercel Project

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. Import the repo into Vercel.
3. Keep the framework preset as Next.js.

## 3. Add Environment Variables in Vercel

Add these variables to Production, Preview, and Development as needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SENTRY_DSN` if monitoring is enabled
- `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` if uploading source maps to Sentry

Important:

- Do not expose the Supabase service role key in Vercel for this app.
- This project is designed to work with the public anon key plus RLS.

## 4. Deploy

1. Trigger the first Vercel deployment.
2. Open the deployed app.
3. Test:
   - sign up
   - sign in
   - sign out
   - dashboard access control
   - source creation
   - note creation
   - checklist progress saving
   - attachment upload/download

## 5. Post-Deploy Validation

- Verify redirect URLs are correct in Supabase Auth
- Verify `source-files` storage bucket policies are present
- Verify RLS is enabled on user-owned tables
- Confirm build logs are clean
- Confirm browser console does not show missing env var errors
