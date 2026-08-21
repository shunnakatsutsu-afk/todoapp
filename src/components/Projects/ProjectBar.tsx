import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Project } from '../../lib/types'

function ProjectChip({
  project,
  selected,
  onSelect,
  onRename,
}: {
  project: Project
  selected: boolean
  onSelect: () => void
  onRename: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)

  const commit = () => {
    const trimmed = name.trim()
    setEditing(false)
    if (trimmed && trimmed !== project.name) onRename(trimmed)
    else setName(project.name)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setName(project.name)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        className="shrink-0 text-sm px-3 py-1.5 rounded-full border border-brand-400 outline-none w-32"
      />
    )
  }

  return (
    <button
      onClick={onSelect}
      onDoubleClick={() => setEditing(true)}
      title="ダブルクリックで名前を変更"
      className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors ${
        selected
          ? 'bg-brand-500 text-white font-semibold'
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {project.name}
    </button>
  )
}

export function ProjectBar({
  projects,
  selectedId,
  onSelect,
  onRename,
  onManage,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onManage: () => void
}) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {projects.map((p) => (
          <ProjectChip
            key={p.id}
            project={p}
            selected={selectedId === p.id}
            onSelect={() => onSelect(p.id)}
            onRename={(name) => onRename(p.id, name)}
          />
        ))}
        <button
          onClick={onManage}
          className="shrink-0 text-xs px-2.5 py-1.5 rounded-full text-gray-400 hover:text-brand-600 hover:bg-gray-50 transition-colors"
          title="プロジェクトを管理"
        >
          ＋ 追加/削除
        </button>
      </div>
    </div>
  )
}
