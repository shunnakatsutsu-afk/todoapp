-- 個人用TODOアプリ用スキーマ
-- Supabaseダッシュボードの SQL Editor でこのファイルの内容をそのまま実行してください。

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  parent_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  memo text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  category text,
  start_date date,
  due_date date,
  recurrence text not null default 'none'
    check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_parent_id_idx on public.tasks (parent_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- updated_at を自動更新
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Row Level Security: 自分のデータしか読み書きできないようにする
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "select own projects" on public.projects;
create policy "select own projects" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "insert own projects" on public.projects;
create policy "insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own projects" on public.projects;
create policy "update own projects" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "delete own projects" on public.projects;
create policy "delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

drop policy if exists "select own tasks" on public.tasks;
create policy "select own tasks" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "insert own tasks" on public.tasks;
create policy "insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own tasks" on public.tasks;
create policy "update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

drop policy if exists "delete own tasks" on public.tasks;
create policy "delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);
