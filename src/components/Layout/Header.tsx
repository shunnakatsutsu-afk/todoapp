import { supabase } from '../../lib/supabase'

export function Header({ email }: { email: string | undefined }) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-800">マイTODO</h1>
          {email && <p className="text-xs text-gray-400">{email}</p>}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
