# Blink deployment

This branch is configured for a Render web service:

- Build: `npm install && npm run build:web`
- Start: `npm run serve`
- Output: `dist`

Set these environment variables in Render before deploying:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
