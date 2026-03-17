create table if not exists public.source_reminder_dismissals (
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  reminder_key text not null,
  source_updated_at timestamptz not null,
  dismissed_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, source_id, reminder_key)
);

create index if not exists source_reminder_dismissals_user_idx
  on public.source_reminder_dismissals (user_id, dismissed_at desc);

alter table public.source_reminder_dismissals enable row level security;

drop policy if exists "Source reminder dismissals are owned by user" on public.source_reminder_dismissals;
create policy "Source reminder dismissals are owned by user"
on public.source_reminder_dismissals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
