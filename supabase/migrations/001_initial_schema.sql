-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users (app-level profile linked to Supabase Auth) ───
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  access text not null default 'basic' check (access in ('basic', 'full')),
  clearance int not null default 1 check (clearance between 1 and 5),
  active boolean not null default true,
  full_name text not null default '',
  department text not null default '',
  created_at timestamptz not null default now()
);

-- ─── Entries (persons, companies, addresses, mobiles, vehicles) ───
create table public.entries (
  id bigserial primary key,
  category text not null check (category in ('person', 'company', 'mobile', 'address', 'vehicle')),
  name text not null,
  context text not null default 'confirmed' check (context in ('confirmed', 'likely', 'rumor')),
  narrative text not null default '',
  created_by text not null,
  created_at timestamptz not null default now(),
  country text,
  tags text[] default '{}',
  sensitivity text default 'standard' check (sensitivity in ('standard', 'sensitive', 'confidential', 'top-secret'))
);

-- ─── Entry Links (many-to-many self-referencing) ───
create table public.entry_links (
  entry_a bigint not null references public.entries(id) on delete cascade,
  entry_b bigint not null references public.entries(id) on delete cascade,
  primary key (entry_a, entry_b),
  check (entry_a < entry_b)
);

create index idx_entry_links_a on public.entry_links(entry_a);
create index idx_entry_links_b on public.entry_links(entry_b);

-- ─── Reports ───
create table public.reports (
  id bigserial primary key,
  title text not null,
  type text not null check (type in ('meeting-debrief', 'field-report', 'analysis', 'intelligence-brief')),
  date date not null,
  location text,
  attendees bigint[] default '{}',
  external_attendees text[] default '{}',
  sections jsonb not null default '[]',
  tags text[] default '{}',
  linked_entities bigint[] default '{}',
  created_by text not null,
  created_at timestamptz not null default now(),
  overall_sensitivity text not null default 'standard' check (overall_sensitivity in ('standard', 'sensitive', 'confidential', 'top-secret')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed', 'archived'))
);

-- ─── Inferred Connections ───
create table public.inferred_connections (
  id bigserial primary key,
  entity_a bigint not null references public.entries(id) on delete cascade,
  entity_b bigint not null references public.entries(id) on delete cascade,
  confidence int not null check (confidence between 0 and 100),
  reason text not null,
  category text not null check (category in ('shared-location', 'co-attendance', 'organizational', 'social-proximity', 'pattern-match', 'behavioral')),
  evidence text[] default '{}',
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'confirmed', 'dismissed'))
);

-- ─── Pending Validations ───
create table public.pending_validations (
  id bigserial primary key,
  entry_id bigint not null references public.entries(id) on delete cascade,
  target_name text not null,
  suggested_link text not null,
  suggested_link_id bigint,
  submitted_by text not null,
  submitted_at timestamptz not null default now(),
  reason text not null,
  resolved boolean default false,
  approved boolean
);

-- ─── Signals ───
create table public.signals (
  id bigserial primary key,
  entity_id bigint not null references public.entries(id) on delete cascade,
  entity_name text not null,
  set_by text not null,
  set_at timestamptz not null default now()
);

-- ─── Audit Logs ───
create table public.logs (
  id bigserial primary key,
  ts timestamptz not null default now(),
  username text not null,
  action text not null,
  detail text not null
);

-- ─── Notifications ───
create table public.notifications (
  id bigserial primary key,
  message text not null,
  for_user text not null,
  ts timestamptz not null default now(),
  read boolean not null default false
);

-- ─── Row Level Security ───
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.entry_links enable row level security;
alter table public.reports enable row level security;
alter table public.inferred_connections enable row level security;
alter table public.pending_validations enable row level security;
alter table public.signals enable row level security;
alter table public.logs enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Entries: authenticated users can CRUD
create policy "Entries viewable by authenticated" on public.entries for select to authenticated using (true);
create policy "Entries insertable by authenticated" on public.entries for insert to authenticated with check (true);
create policy "Entries updatable by authenticated" on public.entries for update to authenticated using (true);
create policy "Entries deletable by authenticated" on public.entries for delete to authenticated using (true);

-- Entry links
create policy "Links viewable by authenticated" on public.entry_links for select to authenticated using (true);
create policy "Links insertable by authenticated" on public.entry_links for insert to authenticated with check (true);
create policy "Links deletable by authenticated" on public.entry_links for delete to authenticated using (true);

-- Reports
create policy "Reports viewable by authenticated" on public.reports for select to authenticated using (true);
create policy "Reports insertable by authenticated" on public.reports for insert to authenticated with check (true);
create policy "Reports updatable by authenticated" on public.reports for update to authenticated using (true);

-- Inferred connections
create policy "Connections viewable by authenticated" on public.inferred_connections for select to authenticated using (true);
create policy "Connections insertable by authenticated" on public.inferred_connections for insert to authenticated with check (true);
create policy "Connections updatable by authenticated" on public.inferred_connections for update to authenticated using (true);

-- Pending validations
create policy "Validations viewable by authenticated" on public.pending_validations for select to authenticated using (true);
create policy "Validations insertable by authenticated" on public.pending_validations for insert to authenticated with check (true);
create policy "Validations updatable by authenticated" on public.pending_validations for update to authenticated using (true);

-- Signals
create policy "Signals viewable by authenticated" on public.signals for select to authenticated using (true);
create policy "Signals insertable by authenticated" on public.signals for insert to authenticated with check (true);
create policy "Signals deletable by authenticated" on public.signals for delete to authenticated using (true);

-- Logs
create policy "Logs viewable by authenticated" on public.logs for select to authenticated using (true);
create policy "Logs insertable by authenticated" on public.logs for insert to authenticated with check (true);

-- Notifications
create policy "Users see own notifications" on public.notifications for select to authenticated using (for_user = (select username from public.profiles where id = auth.uid()));
create policy "Notifications insertable by authenticated" on public.notifications for insert to authenticated with check (true);
create policy "Users can update own notifications" on public.notifications for update to authenticated using (for_user = (select username from public.profiles where id = auth.uid()));

-- Indexes for performance
create index idx_entries_category on public.entries(category);
create index idx_entries_country on public.entries(country);
create index idx_entries_name_trgm on public.entries using gin (name gin_trgm_ops);
create index idx_logs_ts on public.logs(ts desc);
create index idx_notifications_user on public.notifications(for_user);
create index idx_reports_date on public.reports(date desc);
create index idx_inferred_connections_entities on public.inferred_connections(entity_a, entity_b);
