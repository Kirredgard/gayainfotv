-- GAYA INFO TV — Schéma Supabase minimal
-- À exécuter dans Supabase > SQL Editor

create table if not exists public.gaya_cms (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.gaya_comments (
  article_id text primary key,
  comments jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gaya_cms enable row level security;
alter table public.gaya_comments enable row level security;

-- Lecture publique du contenu du site
create policy "Public can read CMS content" on public.gaya_cms
for select using (true);

create policy "Public can read comments" on public.gaya_comments
for select using (true);

-- Écriture réservée aux utilisateurs connectés dans Supabase Auth
create policy "Authenticated users can write CMS content" on public.gaya_cms
for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update CMS content" on public.gaya_cms
for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can write comments" on public.gaya_comments
for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update comments" on public.gaya_comments
for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public.gaya_cms (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
