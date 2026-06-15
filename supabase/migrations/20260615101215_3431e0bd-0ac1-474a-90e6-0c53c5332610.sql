
-- Enum for roles
create type public.app_role as enum ('admin', 'user');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Admin read/manage policies for profiles
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Internships catalog
create table public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  domain text not null,
  location text,
  stipend text,
  description text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.internships to anon, authenticated;
grant insert, update, delete on public.internships to authenticated;
grant all on public.internships to service_role;
alter table public.internships enable row level security;
create policy "Anyone reads active internships" on public.internships for select to anon, authenticated using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage internships" on public.internships for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Analyses
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  candidate_name text,
  experience_level text,
  profile_score integer,
  top_match_role text,
  top_match_percent integer,
  hire_recommendation text,
  result jsonb not null,
  created_at timestamptz not null default now()
);
grant select on public.analyses to authenticated;
grant insert on public.analyses to anon, authenticated;
grant all on public.analyses to service_role;
alter table public.analyses enable row level security;
create policy "Anyone can insert analyses" on public.analyses for insert to anon, authenticated with check (true);
create policy "Users read own analyses" on public.analyses for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all analyses" on public.analyses for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete analyses" on public.analyses for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- AI usage logs
create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  latency_ms integer,
  success boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);
grant select on public.ai_usage_logs to authenticated;
grant all on public.ai_usage_logs to service_role;
alter table public.ai_usage_logs enable row level security;
create policy "Admins read usage" on public.ai_usage_logs for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger touch_profiles before update on public.profiles for each row execute function public.touch_updated_at();
create trigger touch_internships before update on public.internships for each row execute function public.touch_updated_at();
