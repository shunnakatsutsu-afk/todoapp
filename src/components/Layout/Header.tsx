import { supabase } from '../../lib/supabase'

export type ViewTab = 'list' | 'wbs' | 'archive'

const TABS: { key: ViewTab; label: string }[] = [
  { key: 'list', label: 'リスト' },
  { key: 'wbs', label: 'WBS' },
  { key: 'archive', label: '完了履歴' },
]

export function Header({
  email,
  activeTab,
  onTabChange,
}: {
  email: string | undefined
  activeTab: ViewTab
  onTabChange: (tab: ViewTab) => void
}) {
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
      <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              activeTab === tab.key ? 'bg-white text-brand-700 font-semibold' : 'text-brand-100 hover:bg-brand-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}
