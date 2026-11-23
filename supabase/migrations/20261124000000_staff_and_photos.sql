-- Staff roles, plot assignments and inspection photos.

-- Paridhi staff. Owners need no row here; anyone with a plot is its owner.
create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('ops', 'inspector', 'advocate')),
  display_name text not null check (length(display_name) between 1 and 120),
  -- Inspector ID or advocate enrolment number, shown to owners.
  staff_code text not null default '' check (length(staff_code) <= 40),
  created_at timestamptz not null default now()
);

-- Who inspects each plot and which advocate handles it. Inspectors and advocates only
-- see the plots they are assigned to; ops staff see every plot.
alter table public.properties
  add column inspector_user_id uuid references public.staff_members (user_id) on delete set null,
  add column advocate_user_id uuid references public.staff_members (user_id) on delete set null;

create index properties_inspector_user_id_idx on public.properties (inspector_user_id);
create index properties_advocate_user_id_idx on public.properties (advocate_user_id);

-- Inspection photos, hashed on arrival. Kept in Postgres for the pilot; move the bytes to
-- object storage once volume grows (see docs/ROADMAP.md).
create table public.photos (
  id text primary key,
  property_id text not null references public.properties (id) on delete restrict,
  visit_id text,
  peg_id text not null,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  bytes bytea not null,
  size_bytes integer not null check (size_bytes > 0),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  captured_at timestamptz not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  uploaded_by uuid references auth.users (id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index photos_property_visit_idx on public.photos (property_id, visit_id);

-- A photo's content and location never change, it is attached to at most one visit, and it
-- is never deleted. (uploaded_by may still be cleared if the uploader's account is deleted.)
create function public.guard_photo_change() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'photos cannot be deleted';
  end if;
  if new.bytes is distinct from old.bytes
     or new.sha256 is distinct from old.sha256
     or new.property_id is distinct from old.property_id
     or new.peg_id is distinct from old.peg_id
     or new.captured_at is distinct from old.captured_at
     or new.lat is distinct from old.lat
     or new.lng is distinct from old.lng
     or (old.visit_id is not null and new.visit_id is distinct from old.visit_id) then
    raise exception 'photos are immutable once uploaded and attached';
  end if;
  return new;
end;
$$;

create trigger photos_immutable
  before update or delete on public.photos
  for each row execute function public.guard_photo_change();

alter table public.staff_members enable row level security;
alter table public.photos enable row level security;

revoke all on table public.staff_members, public.photos from anon, authenticated;
revoke execute on function public.guard_photo_change() from public, anon, authenticated;
