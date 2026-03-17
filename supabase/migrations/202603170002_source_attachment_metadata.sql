alter table public.sources
  add column if not exists file_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists file_uploaded_at timestamptz;

alter table public.sources
  drop constraint if exists sources_file_size_bytes_check;

alter table public.sources
  add constraint sources_file_size_bytes_check
  check (file_size_bytes is null or file_size_bytes >= 0);
