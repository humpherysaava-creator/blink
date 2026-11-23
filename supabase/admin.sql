-- Create a profiles table and server-enforced admin marker.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
     or coalesce(auth.jwt() ->> 'email', '') = 'humpherysaava7@gmail.com';
$$;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Admins can read all profiles"
on public.profiles for select
using (public.is_admin());

create policy "Users can update their own non-role fields"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update profiles"
on public.profiles for update
using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'humpherysaava7@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Run once after the admin account exists. This sets a protected app_metadata role.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = 'humpherysaava7@gmail.com';
