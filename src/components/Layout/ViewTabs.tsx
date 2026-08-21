export type ViewTab = 'list' | 'calendar' | 'archive'

const TABS: { key: ViewTab; label: string }[] = [
  { key: 'list', label: 'リスト' },
  { key: 'calendar', label: 'カレンダー' },
  { key: 'archive', label: '完了履歴' },
]

export function ViewTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ViewTab
  onTabChange: (tab: ViewTab) => void
}) {
  return (
    <div className="bg-brand-500">
      <div className="max-w-4xl mx-auto px-4 flex gap-1 py-2">
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
    </div>
  )
}
