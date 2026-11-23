-- Paridhi initial schema.
--
-- Only the Paridhi API reads and writes these tables, connecting as the database owner and
-- scoping every query to the signed-in owner. Row level security is enabled with no policies,
-- and grants to the public API roles are revoked, so the Supabase Data API cannot reach them.

create table public.properties (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  -- The PropertyRecord document (see shared/types.ts) without its activity log.
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_owner_id_idx on public.properties (owner_id);

create table public.activity_events (
  id text primary key,
  property_id text not null references public.properties (id) on delete cascade,
  at timestamptz not null,
  category text not null check (category in ('CAMERA', 'INSPECTION', 'REGISTRY', 'LEGAL', 'SYSTEM')),
  severity text not null check (severity in ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
  title text not null,
  description text not null
);

create index activity_events_property_at_idx on public.activity_events (property_id, at desc);

-- Signed evidence. Rows can be added but never changed or removed, and a property with
-- evidence cannot be deleted.
create table public.evidence_records (
  id text primary key,
  property_id text not null references public.properties (id) on delete restrict,
  kind text not null,
  received_at timestamptz not null,
  payload text not null,
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  signature text not null,
  key_id text not null,
  algorithm text not null default 'Ed25519'
);

create index evidence_records_property_received_idx on public.evidence_records (property_id, received_at);

create function public.reject_evidence_change() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'evidence_records is append-only';
end;
$$;

create trigger evidence_records_append_only
  before update or delete on public.evidence_records
  for each row execute function public.reject_evidence_change();

alter table public.properties enable row level security;
alter table public.activity_events enable row level security;
alter table public.evidence_records enable row level security;

revoke all on table public.properties, public.activity_events, public.evidence_records from anon, authenticated;
revoke execute on function public.reject_evidence_change() from public, anon, authenticated;
