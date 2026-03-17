create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'citation_style'
  ) then
    create type public.citation_style as enum ('apa', 'mla', 'chicago');
  end if;
  if not exists (
    select 1 from pg_type where typname = 'source_type'
  ) then
    create type public.source_type as enum (
      'journal_article',
      'book',
      'website',
      'report',
      'thesis',
      'conference_paper',
      'other'
    );
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#0f766e',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subjects_color_check check (color ~ '^#([0-9A-Fa-f]{6})$')
);

create unique index if not exists subjects_user_name_idx
  on public.subjects (user_id, lower(name));

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  authors text[] not null default '{}',
  year integer,
  publisher text,
  url text,
  doi text,
  tags text[] not null default '{}',
  abstract text,
  source_type public.source_type not null default 'journal_article',
  citation_style public.citation_style not null default 'apa',
  file_name text,
  file_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sources_year_check check (year is null or year between 1000 and 3000)
);

create index if not exists sources_user_created_idx
  on public.sources (user_id, created_at desc);

create index if not exists sources_user_year_idx
  on public.sources (user_id, year desc);

create table if not exists public.source_subjects (
  source_id uuid not null references public.sources (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (source_id, subject_id)
);

create index if not exists source_subjects_user_idx
  on public.source_subjects (user_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid references public.sources (id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists notes_user_updated_idx
  on public.notes (user_id, updated_at desc);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text not null,
  position integer not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.checklist_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  checklist_item_id uuid not null references public.checklist_items (id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, checklist_item_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists subjects_set_updated_at on public.subjects;
create trigger subjects_set_updated_at
before update on public.subjects
for each row execute procedure public.set_updated_at();

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row execute procedure public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute procedure public.set_updated_at();

drop trigger if exists checklist_progress_set_updated_at on public.checklist_progress;
create trigger checklist_progress_set_updated_at
before update on public.checklist_progress
for each row execute procedure public.set_updated_at();

create or replace function public.ensure_owned_subject_link()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.sources s
    where s.id = new.source_id
      and s.user_id = new.user_id
  ) then
    raise exception 'Source does not belong to the current user.';
  end if;

  if not exists (
    select 1
    from public.subjects sub
    where sub.id = new.subject_id
      and sub.user_id = new.user_id
  ) then
    raise exception 'Subject does not belong to the current user.';
  end if;

  return new;
end;
$$;

drop trigger if exists source_subjects_ownership_guard on public.source_subjects;
create trigger source_subjects_ownership_guard
before insert or update on public.source_subjects
for each row execute procedure public.ensure_owned_subject_link();

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.sources enable row level security;
alter table public.source_subjects enable row level security;
alter table public.notes enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_progress enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are updateable by owner" on public.profiles;
create policy "Profiles are updateable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Subjects are owned by user" on public.subjects;
create policy "Subjects are owned by user"
on public.subjects for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Sources are owned by user" on public.sources;
create policy "Sources are owned by user"
on public.sources for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Source links are owned by user" on public.source_subjects;
create policy "Source links are owned by user"
on public.source_subjects for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Notes are owned by user" on public.notes;
create policy "Notes are owned by user"
on public.notes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Checklist items are readable by authenticated users" on public.checklist_items;
create policy "Checklist items are readable by authenticated users"
on public.checklist_items for select
using (auth.role() = 'authenticated');

drop policy if exists "Checklist progress is owned by user" on public.checklist_progress;
create policy "Checklist progress is owned by user"
on public.checklist_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.checklist_items (slug, label, description, position)
values
  ('quoted-text-quotation-marks', 'All quoted text has quotation marks', 'Check every direct quotation for quotation marks and exact wording copied from the original source.', 1),
  ('paraphrased-ideas-cited', 'All paraphrased ideas have citations', 'Make sure each paraphrased idea is followed by a proper citation to the original source.', 2),
  ('bibliography-included', 'Bibliography or reference list included', 'Confirm the final paper includes a complete references, works cited, or bibliography section.', 3),
  ('in-text-citations-checked', 'In-text citations checked', 'Review author names, years, page numbers, and punctuation in each in-text citation.', 4),
  ('source-urls-dois-verified', 'Source URLs and DOIs verified', 'Open links and verify DOI, URL, title, and author details against the original publication.', 5),
  ('no-unattributed-copying', 'No copied paragraph without attribution', 'Scan for any borrowed paragraph or sentence that still needs quotation marks, paraphrasing, or citation.', 6),
  ('final-originality-review', 'Final paper reviewed for originality', 'Read the paper once more to catch accidental borrowing, patchwriting, or citation gaps before submission.', 7)
on conflict (slug) do update
set label = excluded.label,
    description = excluded.description,
    position = excluded.position;

insert into storage.buckets (id, name, public)
values ('source-files', 'source-files', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can view their source files" on storage.objects;
create policy "Authenticated users can view their source files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'source-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can upload their source files" on storage.objects;
create policy "Authenticated users can upload their source files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'source-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can update their source files" on storage.objects;
create policy "Authenticated users can update their source files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'source-files'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'source-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can delete their source files" on storage.objects;
create policy "Authenticated users can delete their source files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'source-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);
