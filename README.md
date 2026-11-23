# Blink PWA deployment

Blink is a plain HTML, CSS, and JavaScript Progressive Web App (PWA). Import this repository into Vercel and deploy the `deploy-web-render` branch. `vercel.json` serves the static app in `public/`; `/api/config` provides only the Supabase project URL and public anon/publishable key from Vercel environment variables.

## Vercel setup

In **Project → Settings → Environment Variables**, add these for Production (and Preview if desired):

- `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase public anon/publishable key

Redeploy after adding/changing variables. Never add a Supabase `service_role` key or a user password to Vercel client settings or app files.

## PWA install

The app provides an install button when the browser supports the install prompt. Browsers require the visitor to approve installation; websites cannot silently download or install themselves. On iPhone/iPad, open the site in Safari, tap **Share**, then **Add to Home Screen**.

## Supabase admin setup

Create the admin account, then run `supabase/admin.sql` in the Supabase SQL Editor. The app recognizes the configured admin email and protected `app_metadata.role` and loads the user list from `public.profiles`. Report review is shown as not configured because this repository does not yet include a reports table or report workflow.
