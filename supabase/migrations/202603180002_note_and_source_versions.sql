create table if not exists public.source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  snapshot jsonb not null,
  reason text not null default 'manual_save',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists source_versions_source_created_idx
  on public.source_versions (source_id, created_at desc);

create index if not exists source_versions_user_created_idx
  on public.source_versions (user_id, created_at desc);

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  snapshot jsonb not null,
  reason text not null default 'manual_save',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists note_versions_note_created_idx
  on public.note_versions (note_id, created_at desc);

create index if not exists note_versions_user_created_idx
  on public.note_versions (user_id, created_at desc);

alter table public.source_versions enable row level security;
alter table public.note_versions enable row level security;

drop policy if exists "Source versions are owned by user" on public.source_versions;
create policy "Source versions are owned by user"
on public.source_versions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Note versions are owned by user" on public.note_versions;
create policy "Note versions are owned by user"
on public.note_versions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
