import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskPriority } from '../../lib/types'
import { PRIORITY_LABEL } from '../../lib/types'

export interface TaskFormValues {
  title: string
  due_date: string | null
  priority: TaskPriority
  category: string | null
  memo: string | null
}

export function TaskFormModal({
  title = 'タスクを追加',
  onSubmit,
  onClose,
}: {
  title?: string
  onSubmit: (values: TaskFormValues) => void
  onClose: () => void
}) {
  const [taskTitle, setTaskTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [category, setCategory] = useState('')
  const [memo, setMemo] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = taskTitle.trim()
    if (!trimmed) return
    onSubmit({
      title: trimmed,
      due_date: dueDate || null,
      priority,
      category: category.trim() || null,
      memo: memo.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/20" aria-label="閉じる" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-brand-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-700 text-xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">タイトル</label>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              autoFocus
              required
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">期限</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">優先度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              >
                {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">カテゴリ</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: 仕事、プライベート"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 text-white text-sm font-medium py-2 hover:bg-brand-600 transition-colors"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  )
}
