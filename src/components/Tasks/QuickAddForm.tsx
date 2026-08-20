import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskPriority } from '../../lib/types'
import { PRIORITY_LABEL } from '../../lib/types'

export interface QuickAddInput {
  title: string
  due_date: string | null
  priority: TaskPriority
}

export function QuickAddForm({
  onAdd,
  placeholder = 'タスクを追加…',
  autoFocus = false,
}: {
  onAdd: (input: QuickAddInput) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({ title: trimmed, due_date: dueDate || null, priority })
    setTitle('')
    setDueDate('')
    setPriority('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 min-w-[140px] rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        title="期限"
        className="rounded-lg border border-brand-200 px-2 py-2 text-sm w-36"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        title="優先度"
        className="rounded-lg border border-brand-200 px-2 py-2 text-sm w-20"
      >
        {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-brand-500 text-white text-sm font-medium px-4 py-2 hover:bg-brand-600 transition-colors"
      >
        追加
      </button>
    </form>
  )
}
