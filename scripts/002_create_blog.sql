-- Blog posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  content text not null,
  content_en text,
  category text not null default 'general',
  tags text[] default '{}',
  cover_color text default '#f1f5f9',
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade
);

alter table public.blog_posts enable row level security;

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
create policy "Anyone can read published blog posts" on public.blog_posts for select using (published = true or auth.uid() = user_id);

drop policy if exists "Authenticated users can insert blog posts" on public.blog_posts;
create policy "Authenticated users can insert blog posts" on public.blog_posts for insert with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update their blog posts" on public.blog_posts;
create policy "Authenticated users can update their blog posts" on public.blog_posts for update using (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete their blog posts" on public.blog_posts;
create policy "Authenticated users can delete their blog posts" on public.blog_posts for delete using (auth.uid() = user_id);
