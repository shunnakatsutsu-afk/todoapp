import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Project } from '../../lib/types'

function ProjectRow({
  project,
  onRename,
  onDelete,
}: {
  project: Project
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(project.name)

  useEffect(() => {
    setName(project.name)
  }, [project.name])

  const handleDelete = () => {
    if (confirm(`「${project.name}」を削除しますか？このプロジェクト内のタスクもすべて削除されます。`)) {
      onDelete(project.id)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          const trimmed = name.trim()
          if (trimmed && trimmed !== project.name) onRename(project.id, trimmed)
        }}
        className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50"
      >
        削除
      </button>
    </div>
  )
}

export function ProjectManagerModal({
  projects,
  onAdd,
  onRename,
  onDelete,
  onClose,
}: {
  projects: Project[]
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [newName, setNewName] = useState('')

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/20" aria-label="閉じる" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-brand-800">プロジェクト管理</h2>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-700 text-xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {projects.length === 0 && <p className="text-sm text-brand-400">プロジェクトがありません</p>}
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新しいプロジェクト名"
            className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-500 text-white text-sm font-medium px-4 py-2 hover:bg-brand-600 transition-colors"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  )
}
