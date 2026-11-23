# Blink

Expo social app with secure Supabase authentication and an admin dashboard.

## Setup

1. Create a Supabase project.
2. In Authentication > Providers, enable Email.
3. Create the admin account for `humpherysaava7@gmail.com` and set its password in Supabase.
4. Run the SQL in `supabase/admin.sql` from the Supabase SQL editor.
5. Copy `.env.example` to `.env`, then add your project URL and anonymous key.

```bash
npm install
npm start
```

Never commit the password, service-role key, or `.env` file.
