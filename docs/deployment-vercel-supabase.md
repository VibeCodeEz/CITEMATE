# Deploying CiteMate to Vercel, Netlify, or Another Host

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

## 2. Create the Hosting Project

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. Import the repo into your hosting provider.
3. Keep the framework preset as Next.js.

## 3. Add Environment Variables in Your Host

Add these variables to Production, Preview, and Development as needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SENTRY_DSN` if monitoring is enabled
- `GROQ_API_KEY` for the Research Assistant
- `GROQ_MODEL` if you want to override the default model
- `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` if uploading source maps to Sentry

Important:

- Do not expose the Supabase service role key in the host for this app.
- This project is designed to work with the public anon key plus RLS.
- Local `.env` or `.env.local` files do not get deployed automatically. Re-enter the values in the hosting dashboard.
- If you add or change a server-only variable such as `GROQ_API_KEY`, trigger a fresh deploy so the serverless functions rebuild with the new environment.

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
- Call the Research Assistant once and confirm `/api/ai/assistant` does not return a 503 or 500
