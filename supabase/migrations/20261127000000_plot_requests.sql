-- Plot requests: people asking for a plot check, from the public website or their account.
--
-- The API server reads and writes this table with its own database connection. While the site
-- runs without that connection, the website form can still add a request through the Supabase
-- Data API as the anon role, which may only insert a new website request and never read one.

create table public.plot_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'website' check (source in ('website', 'account')),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email like '%_@_%'),
  phone text check (char_length(phone) <= 40),
  country text check (char_length(country) <= 80),
  state text not null check (char_length(state) between 1 and 60),
  district text not null check (char_length(district) between 1 and 80),
  village text check (char_length(village) <= 120),
  survey_number text check (char_length(survey_number) <= 80),
  notes text check (char_length(notes) <= 1000),
  check (source = 'account' or user_id is null)
);

create index plot_requests_created_at_idx on public.plot_requests (created_at desc);
create index plot_requests_user_id_idx on public.plot_requests (user_id);

alter table public.plot_requests enable row level security;

revoke all on table public.plot_requests from anon, authenticated;

-- The website form: insert only, only these columns, only as a new website request.
grant insert (name, email, phone, country, state, district, village, survey_number, notes)
  on table public.plot_requests to anon;

create policy "Website visitors can send a plot request"
  on public.plot_requests
  for insert
  to anon
  with check (source = 'website' and user_id is null and status = 'new');
