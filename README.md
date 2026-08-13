# マイTODO

個人用のTODOアプリ。React + Vite + TypeScript + Tailwind CSS(黄緑ベース) + Supabase(Auth/PostgreSQL)で構築。GitHub Pagesにデプロイして、PC・スマホどちらからもアクセスできる。

## 機能

- タスクのリスト化・カレンダー表示
- 期限設定、繰り返し設定(毎日/毎週/毎月)
- 親子関係によるタスクの細分化(サブタスク)
- ステータス管理(未着手/着手中/完了)
- 優先度・カテゴリ設定
- タスクごとのメモ
- ステータス/優先度/カテゴリでの絞り込み、期限・優先度でのソート
- 完了タスクの履歴表示
- 複数デバイス間でのリアルタイム同期

## 1. Supabaseのセットアップ

1. [Supabase](https://supabase.com/)で無料アカウントを作成し、新規プロジェクトを作成する。
2. プロジェクトのSQL Editorを開き、`supabase/schema.sql` の内容をそのまま実行する(テーブル・RLSポリシーが作成される)。
3. **Authentication → Providers → Email** で「Allow new users to sign up」をオフにする(個人用アプリのため、第三者が勝手にアカウント登録できないようにする)。
4. **Authentication → Users → Add user** で自分用のアカウント(メールアドレス・パスワード)を1つ作成する。
5. **Project Settings → API** から `Project URL` と `anon public` キーを控えておく。

## 2. ローカルでの開発

```bash
npm install
cp .env.example .env.local
# .env.local に Supabase の URL と anon key を設定する
npm run dev
```

## 3. GitHub Pagesへのデプロイ

1. このプロジェクトをGitHubリポジトリにpushする。
2. リポジトリの **Settings → Pages** で、Source を「GitHub Actions」に設定する。
3. リポジトリの **Settings → Secrets and variables → Actions** で以下のSecretsを登録する。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `main` ブランチにpushすると `.github/workflows/deploy.yml` が自動的にビルド・デプロイを行う。
5. デプロイ完了後、`https://<ユーザー名>.github.io/<リポジトリ名>/` でアクセスできる。

### 補足: anon keyの公開について

`VITE_SUPABASE_ANON_KEY` はビルド後のJSファイルに埋め込まれ、誰でも閲覧できる状態になるが、これはSupabaseの想定通りの使い方。実際のデータ保護は `schema.sql` で設定したRow Level Security(RLS)が担っており、ログインしたユーザー自身のタスクしか読み書きできない。

## ディレクトリ構成

```
src/
  lib/          Supabaseクライアント・型定義・ユーティリティ
  hooks/        認証・タスクデータ取得のカスタムフック
  components/   画面パーツ(Auth / Layout / Tasks / Filters / Calendar)
supabase/
  schema.sql    Supabaseに投入するテーブル定義・RLSポリシー
```
