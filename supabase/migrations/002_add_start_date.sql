-- 既にschema.sqlを実行済みのプロジェクト向けの追加マイグレーション。
-- Supabaseダッシュボードの SQL Editor でこの内容を実行してください。

alter table public.tasks add column if not exists start_date date;
create index if not exists tasks_start_date_idx on public.tasks (start_date);
