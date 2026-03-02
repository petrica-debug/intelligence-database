-- Cleanup partially applied migration
drop table if exists public.notifications cascade;
drop table if exists public.logs cascade;
drop table if exists public.signals cascade;
drop table if exists public.pending_validations cascade;
drop table if exists public.inferred_connections cascade;
drop table if exists public.reports cascade;
drop table if exists public.entry_links cascade;
drop table if exists public.entries cascade;
drop table if exists public.profiles cascade;
