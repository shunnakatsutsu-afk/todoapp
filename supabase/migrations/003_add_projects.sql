-- 既にschema.sqlを実行済みのプロジェクト向けの追加マイグレーション(プロジェクト機能)。
-- Supabaseダッシュボードの SQL Editor でこの内容を実行してください。
-- 実行後、アプリを開くと「マイプロジェクト」が自動作成され、
-- 既存のタスクは自動的にそこへ割り当てられます(アプリ側で自動処理されるため、
-- 追加の手作業は不要です)。

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

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

alter table public.tasks add column if not exists project_id uuid references public.projects(id) on delete cascade;
create index if not exists tasks_project_id_idx on public.tasks (project_id);
