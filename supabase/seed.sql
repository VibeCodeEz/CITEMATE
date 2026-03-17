do $$
begin
  if to_regclass('public.subjects') is null
    or to_regclass('public.sources') is null
    or to_regclass('public.notes') is null
    or to_regclass('public.checklist_items') is null
    or to_regclass('public.checklist_progress') is null then
    raise exception 'Run supabase/schema.sql before supabase/seed.sql. One or more required tables are missing.';
  end if;
end $$;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'alex.student@example.com',
    crypt('password123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Student"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'jamie.writer@example.com',
    crypt('password123', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jamie Writer"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at,
  last_sign_in_at
)
values
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"alex.student@example.com"}',
    'email',
    'alex.student@example.com',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"jamie.writer@example.com"}',
    'email',
    'jamie.writer@example.com',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (provider, provider_id) do nothing;

insert into public.subjects (id, user_id, name, description, color)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'Sociology 302',
    'Sources for the social stratification paper.',
    '#0f766e'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    'Methods',
    'Research design and methodology references.',
    '#2563eb'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'English Seminar',
    'Close reading and literary criticism sources.',
    '#9333ea'
  )
on conflict (id) do nothing;

insert into public.sources (
  id,
  user_id,
  title,
  authors,
  year,
  publisher,
  url,
  doi,
  tags,
  abstract,
  source_type,
  citation_style
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    'Social Capital in College Success',
    array['Dana Moore', 'Priya Shah'],
    2023,
    'Journal of Student Research',
    'https://example.com/social-capital',
    '10.1000/social-capital',
    array['sociology', 'equity', 'college'],
    'Examines how peer networks shape academic outcomes among first-generation college students.',
    'journal_article',
    'apa'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '11111111-1111-1111-1111-111111111111',
    'Designing Trustworthy Qualitative Interviews',
    array['M. Torres'],
    2021,
    'Methods Review Quarterly',
    'https://example.com/interviews',
    '10.1000/interviews',
    array['methods', 'qualitative'],
    'A practical guide to interview planning, coding, and researcher reflexivity.',
    'report',
    'mla'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '22222222-2222-2222-2222-222222222222',
    'Metaphor and Memory in Modern Poetry',
    array['Elena Brooks'],
    2019,
    'Literary Studies Review',
    'https://example.com/poetry-memory',
    '10.1000/poetry-memory',
    array['poetry', 'memory'],
    'Explores how recurring metaphor structures support memory and interpretation in modern poetry.',
    'journal_article',
    'chicago'
  )
on conflict (id) do nothing;

insert into public.source_subjects (source_id, subject_id, user_id)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222'
  )
on conflict (source_id, subject_id) do nothing;

insert into public.notes (id, user_id, source_id, title, content)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    'Key evidence on peer networks',
    'Useful for the argument that informal support systems affect retention. Pull quote needed from section 3.'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442',
    'Interview design checklist',
    'Strong reminder to ask neutral follow-up questions and document positionality before coding.'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444443',
    'Poetry seminar draft note',
    'This source helps frame metaphor as a memory structure rather than just a stylistic choice.'
  )
on conflict (id) do nothing;

insert into public.checklist_progress (user_id, checklist_item_id, completed)
select
  '11111111-1111-1111-1111-111111111111',
  id,
  true
from public.checklist_items
where slug in ('quoted-text-quotation-marks', 'bibliography-included')
on conflict (user_id, checklist_item_id) do update
set completed = excluded.completed,
    updated_at = timezone('utc', now());
