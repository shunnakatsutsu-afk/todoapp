import { supabase } from '../../lib/supabase'

export function Header({ email }: { email: string | undefined }) {
  return (
    <header className="bg-brand-500 text-white">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">マイTODO</h1>
          {email && <p className="text-xs text-brand-100">{email}</p>}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
