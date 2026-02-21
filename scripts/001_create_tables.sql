-- Portfolio content table
create table if not exists public.portfolio_content (
  id text primary key,
  section text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Anyone can read portfolio content" on public.portfolio_content;
create policy "Anyone can read portfolio content" on public.portfolio_content for select using (true);

drop policy if exists "Authenticated users can update portfolio content" on public.portfolio_content;
create policy "Authenticated users can update portfolio content" on public.portfolio_content for update using (auth.uid() is not null);

drop policy if exists "Authenticated users can insert portfolio content" on public.portfolio_content;
create policy "Authenticated users can insert portfolio content" on public.portfolio_content for insert with check (auth.uid() is not null);

drop policy if exists "Authenticated users can delete portfolio content" on public.portfolio_content;
create policy "Authenticated users can delete portfolio content" on public.portfolio_content for delete using (auth.uid() is not null);
