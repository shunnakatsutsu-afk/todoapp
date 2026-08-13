import { useState } from 'react'
import type { FormEvent } from 'react'

export function QuickAddForm({
  onAdd,
  placeholder = 'タスクを追加…',
  autoFocus = false,
}: {
  onAdd: (title: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-500 text-white text-sm font-medium px-4 py-2 hover:bg-brand-600 transition-colors"
      >
        追加
      </button>
    </form>
  )
}
