
-- Lock down trigger-only functions (they only run as triggers)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- has_role should be callable by signed-in users (used in policies) but not anon
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- Tighten analyses insert policy: must match auth.uid() when signed in
drop policy if exists "Anyone can insert analyses" on public.analyses;
create policy "Insert own or anon analyses" on public.analyses
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
