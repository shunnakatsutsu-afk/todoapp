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
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 flex gap-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`text-sm py-2.5 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-700 font-semibold'
                : 'border-transparent text-gray-400 hover:text-brand-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
