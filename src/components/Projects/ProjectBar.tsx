import type { Project } from '../../lib/types'

export function ProjectBar({
  projects,
  selectedId,
  onSelect,
  onManage,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (id: string) => void
  onManage: () => void
}) {
  return (
    <div className="bg-white border-b border-brand-100">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors ${
              selectedId === p.id
                ? 'bg-brand-500 text-white font-semibold'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={onManage}
          className="shrink-0 text-sm px-3 py-1.5 rounded-full border border-dashed border-brand-300 text-brand-500 hover:bg-brand-50"
          title="プロジェクトを管理"
        >
          ⚙ 管理
        </button>
      </div>
    </div>
  )
}
